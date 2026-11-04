// Lecture des relevés bancaires (CSV et PDF) dans le navigateur.
// Aucun fichier n'est envoyé : on en extrait seulement les opérations.

import type { Operation } from "./detection";
import { normaliser } from "./marchands";

// ---------- Montants et dates ----------

const RE_MONTANT = /[-+−]?\s?\d{1,3}(?:[ .  ']\d{3})*(?:[.,]\d{2})(?:\s?[-+])?(?:\s?(?:€|EUR))?(?:\s[SH]\b)?/g;

export function lireMontant(brut: string): { valeur: number; signe: -1 | 1 | 0 } | null {
  let s = brut.trim().replace(/€|EUR/gi, "").replace(/−/g, "-").trim();
  if (!s) return null;
  let signe: -1 | 1 | 0 = 0;
  if (/\sS$/.test(s)) { signe = -1; s = s.slice(0, -2); } // Soll (débit, relevés allemands)
  else if (/\sH$/.test(s)) { signe = 1; s = s.slice(0, -2); } // Haben (crédit)
  s = s.trim();
  if (s.startsWith("-") || s.endsWith("-")) signe = -1;
  else if (s.startsWith("+") || s.endsWith("+")) signe = 1;
  s = s.replace(/^[-+]\s?|\s?[-+]$/g, "").replace(/[\s  ']/g, "");
  if (!/^\d[\d.,]*$/.test(s)) return null;
  const virgule = s.lastIndexOf(",");
  const point = s.lastIndexOf(".");
  if (virgule > point) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const valeur = Number(s);
  if (!Number.isFinite(valeur)) return null;
  return { valeur: Math.abs(valeur), signe };
}

const RE_DATE = /\b(\d{1,2})[\/.\-](\d{1,2})(?:[\/.\-](\d{2,4}))?\b|\b(\d{4})-(\d{2})-(\d{2})\b/;

export function lireDate(brut: string, anneeParDefaut: number): string | null {
  const m = brut.match(RE_DATE);
  if (!m) return null;
  let j: number, mo: number, a: number;
  if (m[4]) { a = +m[4]; mo = +m[5]; j = +m[6]; }
  else {
    j = +m[1]; mo = +m[2];
    a = m[3] ? +m[3] : anneeParDefaut;
    if (a < 100) a += 2000;
  }
  if (mo < 1 || mo > 12 || j < 1 || j > 31 || a < 2000 || a > 2100) return null;
  return `${a}-${String(mo).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
}

function anneeProbable(texte: string): number {
  const compte = new Map<number, number>();
  for (const m of texte.matchAll(/\b(20\d{2})\b/g)) compte.set(+m[1], (compte.get(+m[1]) ?? 0) + 1);
  let meilleure = new Date().getFullYear(), max = 0;
  for (const [a, n] of compte) if (n > max) { meilleure = a; max = n; }
  return meilleure;
}

// ---------- CSV ----------

function decoder(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  if (!utf8.includes("�")) return utf8.replace(/^﻿/, "");
  return new TextDecoder("windows-1252").decode(buffer); // exports de nombreuses banques françaises
}

function decouperCsv(texte: string, sep: string): string[][] {
  const lignes: string[][] = [];
  let ligne: string[] = [], champ = "", guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') guillemets = false;
      else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === sep) { ligne.push(champ); champ = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ); lignes.push(ligne); ligne = []; champ = "";
    } else champ += c;
  }
  if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return lignes.filter((l) => l.some((c) => c.trim()));
}

const COL = {
  date: ["DATE OPERATION", "DATE D OPERATION", "DATE", "BUCHUNGSTAG", "BUCHUNGSDATUM", "DATUM"],
  libelle: ["LIBELLE", "DESCRIPTION", "INTITULE", "NATURE", "DETAIL", "OPERATION", "BENEFICIAIRE", "TIERS",
    "BEGUNSTIGTER", "BEGUENSTIGTER", "ZAHLUNGSEMPFANGER", "EMPFANGER", "AUFTRAGGEBER", "NAME", "VERWENDUNGSZWECK", "BUCHUNGSTEXT", "UMSATZART"],
  montant: ["MONTANT", "AMOUNT", "BETRAG", "VALEUR"],
  debit: ["DEBIT", "SOLL", "AUSGANG"],
  credit: ["CREDIT", "HABEN", "EINGANG"],
};

function correspond(entete: string, mots: string[]) {
  const n = normaliser(entete).replace(/[^A-Z ]/g, " ").replace(/\s+/g, " ").trim();
  return mots.some((m) => n === m || n.startsWith(m + " ") || n.includes(" " + m) || n.startsWith(m));
}

export function lireCsv(buffer: ArrayBuffer): Operation[] {
  const texte = decoder(buffer);
  const premieres = texte.split(/\r?\n/).slice(0, 40).join("\n");
  const sep = [";", "\t", ","].reduce((a, b) =>
    (premieres.split(b).length > premieres.split(a).length ? b : a));
  const lignes = decouperCsv(texte, sep);
  const annee = anneeProbable(texte);

  // Ligne d'en-tête (les banques ajoutent souvent quelques lignes d'infos au début)
  const iEntete = lignes.slice(0, 40).findIndex((l) =>
    l.some((c) => correspond(c, COL.date)) && l.some((c) => correspond(c, [...COL.montant, ...COL.debit])));

  const ops: Operation[] = [];
  if (iEntete >= 0) {
    const entete = lignes[iEntete];
    const idx = (mots: string[], exclure: number[] = []) =>
      entete.findIndex((c, i) => !exclure.includes(i) && correspond(c, mots));
    const iDate = idx(COL.date);
    const iDebit = idx(COL.debit);
    const iCredit = idx(COL.credit);
    const iMontant = idx(COL.montant, [iDebit, iCredit]);
    const iLibelles = entete
      .map((c, i) => (i !== iDate && correspond(c, COL.libelle) ? i : -1))
      .filter((i) => i >= 0);

    for (const l of lignes.slice(iEntete + 1)) {
      const date = iDate >= 0 ? lireDate(l[iDate] ?? "", annee) : null;
      if (!date) continue;
      const libelle = iLibelles.map((i) => l[i] ?? "").filter(Boolean).join(" ").trim();
      let montant: number | null = null;
      let sens: Operation["sens"] = "inconnu";
      if (iMontant >= 0 && l[iMontant]?.trim()) {
        const m = lireMontant(l[iMontant]);
        if (m) { montant = m.valeur; sens = m.signe === -1 ? "debit" : "credit"; }
      } else {
        const d = iDebit >= 0 ? lireMontant(l[iDebit] ?? "") : null;
        const c = iCredit >= 0 ? lireMontant(l[iCredit] ?? "") : null;
        if (d && d.valeur > 0) { montant = d.valeur; sens = "debit"; }
        else if (c && c.valeur > 0) { montant = c.valeur; sens = "credit"; }
      }
      if (montant && libelle) ops.push({ date, libelle, montant, sens });
    }
    if (ops.length) return ops;
  }

  // Sans en-tête reconnu : on devine colonne par colonne
  for (const l of lignes) {
    const iD = l.findIndex((c) => lireDate(c, annee) && c.trim().length <= 10);
    if (iD < 0) continue;
    const montants = l.map((c, i) => ({ i, m: /\d[.,]\d{2}\s*[-+]?$/.test(c.trim()) ? lireMontant(c) : null }))
      .filter((x) => x.m && x.i !== iD);
    if (!montants.length) continue;
    const m = montants[0].m!;
    const libelle = l.filter((c, i) => i !== iD && !montants.some((x) => x.i === i) && /[A-Za-z]{2}/.test(c))
      .sort((a, b) => b.length - a.length)[0];
    if (!libelle) continue;
    ops.push({ date: lireDate(l[iD], annee)!, libelle: libelle.trim(), montant: m.valeur, sens: m.signe === -1 ? "debit" : m.signe === 1 ? "credit" : "inconnu" });
  }
  return ops;
}

// ---------- PDF ----------

type Morceau = { x: number; y: number; texte: string };

const VERSION_PDFJS = "6.5.438";

export async function lirePdf(buffer: ArrayBuffer): Promise<Operation[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker-${VERSION_PDFJS}.min.mjs`;
  const tache = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const doc = await tache.promise;

  const pages: Morceau[][] = [];
  let toutLeTexte = "";
  for (let p = 1; p <= Math.min(doc.numPages, 40); p++) {
    const page = await doc.getPage(p);
    const contenu = await page.getTextContent();
    const morceaux: Morceau[] = [];
    for (const it of contenu.items) {
      if (!("str" in it) || !it.str.trim()) continue;
      morceaux.push({ x: it.transform[4], y: it.transform[5], texte: it.str });
      toutLeTexte += it.str + " ";
    }
    pages.push(morceaux);
  }
  await tache.destroy();

  if (toutLeTexte.trim().length < 30) throw new Error("PDF_IMAGE");
  return operationsDepuisLignesPdf(pages, anneeProbable(toutLeTexte));
}

/** Regroupe les morceaux de texte en lignes, puis repère « date … libellé … montant ». */
export function operationsDepuisLignesPdf(pages: Morceau[][], annee: number): Operation[] {
  const ops: Operation[] = [];
  for (const morceaux of pages) {
    // Lignes : même hauteur (à 2,5 points près)
    const lignes: Morceau[][] = [];
    for (const m of [...morceaux].sort((a, b) => b.y - a.y || a.x - b.x)) {
      const l = lignes.find((l) => Math.abs(l[0].y - m.y) < 2.5);
      if (l) l.push(m); else lignes.push([m]);
    }
    lignes.forEach((l) => l.sort((a, b) => a.x - b.x));

    // Colonnes débit / crédit, si l'en-tête du tableau les nomme
    let xDebit: number | null = null, xCredit: number | null = null;
    for (const l of lignes) {
      for (const m of l) {
        const n = normaliser(m.texte);
        if (/^(DEBIT|DEBITS|SOLL|AUSGANG)\b/.test(n)) xDebit = m.x;
        if (/^(CREDIT|CREDITS|HABEN|EINGANG)\b/.test(n)) xCredit = m.x;
      }
    }

    let derniere: Operation | null = null;
    for (const l of lignes) {
      const texte = l.map((m) => m.texte).join(" ").replace(/\s+/g, " ").trim();
      const debut = texte.match(/^(\d{1,2}[\/.]\d{1,2}(?:[\/.]\d{2,4})?)\b/);
      if (!debut) {
        // Ligne de suite d'un libellé sur deux lignes
        if (derniere && !RE_MONTANT.test(texte) && texte.length < 80 && /[A-Za-z]{3}/.test(texte)) derniere.libelle += " " + texte;
        RE_MONTANT.lastIndex = 0;
        if (derniere) derniere = null;
        continue;
      }
      const date = lireDate(debut[1], annee);
      if (!date) continue;

      // Montants présents sur la ligne (on ignore les dates)
      const sansDates = texte.replace(/\b\d{1,2}[\/.]\d{1,2}(?:[\/.]\d{2,4})?\b/g, " ");
      const trouves = [...sansDates.matchAll(RE_MONTANT)].map((m) => m[0]);
      if (!trouves.length) continue;
      const brut = trouves[0];
      const m = lireMontant(brut);
      if (!m || m.valeur === 0) continue;

      let sens: Operation["sens"] = m.signe === -1 ? "debit" : m.signe === 1 ? "credit" : "inconnu";
      if (sens === "inconnu" && (xDebit !== null || xCredit !== null)) {
        const chiffre = brut.replace(/[^\d]/g, "").slice(0, 3);
        const morceau = l.find((x) => x.texte.replace(/[^\d]/g, "").includes(chiffre) && /\d[.,]\d{2}/.test(x.texte));
        if (morceau) {
          const dD = xDebit !== null ? Math.abs(morceau.x - xDebit) : Infinity;
          const dC = xCredit !== null ? Math.abs(morceau.x - xCredit) : Infinity;
          sens = dD <= dC ? "debit" : "credit";
        }
      }

      const libelle = sansDates.slice(0, sansDates.indexOf(brut)).replace(/\s+/g, " ").trim();
      if (!/[A-Za-z]{2}/.test(libelle)) continue;
      derniere = { date, libelle, montant: m.valeur, sens };
      ops.push(derniere);
    }
  }
  return ops;
}

// ---------- Point d'entrée ----------

export async function lireFichier(fichier: File): Promise<Operation[]> {
  const buffer = await fichier.arrayBuffer();
  const nom = fichier.name.toLowerCase();
  const estPdf = nom.endsWith(".pdf") || new Uint8Array(buffer.slice(0, 4)).every((b, i) => b === [0x25, 0x50, 0x44, 0x46][i]);
  if (estPdf) return lirePdf(buffer);
  if (nom.endsWith(".xlsx") || nom.endsWith(".xls")) throw new Error("EXCEL");
  return lireCsv(buffer);
}
