// Détection des prélèvements réguliers à partir d'une liste d'opérations.
// Tout se passe dans le navigateur : rien n'est envoyé.

import { estExclu, normaliser, trouverMarchand } from "./marchands";

export type Operation = {
  date: string; // AAAA-MM-JJ
  libelle: string;
  montant: number; // toujours positif
  sens: "debit" | "credit" | "inconnu";
};

export type Frequence = "hebdomadaire" | "mensuel" | "trimestriel" | "annuel";

export type FantomeDetecte = {
  id: string;
  nom: string;
  libelleBanque: string;
  montant: number; // montant du dernier prélèvement
  frequence: Frequence;
  coutAnnuel: number;
  occurrences: number;
  dernierPrelevement: string;
  connu: boolean; // service à abonnement reconnu
};

const PAR_AN: Record<Frequence, number> = { hebdomadaire: 52, mensuel: 12, trimestriel: 4, annuel: 1 };

/** Plafond par prélèvement : au-delà, c'est une charge (loyer, crédit…), pas un abonnement oublié. */
const MONTANT_MAX = 150;

// Préfixes bancaires sans intérêt pour identifier le marchand
const BRUIT = [
  /^PRLV SEPA\s*/, /^PRELEVEMENT( SEPA)?\s*/, /^PRLV\s*/, /^ECHEANCE( PRET)?\s*/,
  /^(PAIEMENT|ACHAT|FACTURE) (PAR |PAR CARTE |CARTE |CB )?/, /^CARTE( X?\d{4})?\s*/, /^CB\s*\*?\s*/, /^PAIEMENT\s*/,
  /^SEPA-LASTSCHRIFT\s*/, /^LASTSCHRIFT\s*/, /^KARTENZAHLUNG\s*/, /^FOLGELASTSCHRIFT\s*/, /^ERSTLASTSCHRIFT\s*/,
  /^DEBIT\s*/, /^PAYPAL \*?/, /^PP\.\d+\.PP\s*/,
];

/** Clé de regroupement : les premiers mots significatifs du libellé. */
export function cleMarchand(libelle: string): string {
  const m = trouverMarchand(libelle);
  if (m) return `#${m.nom}`;
  let n = normaliser(libelle);
  for (let i = 0; i < 3; i++) for (const b of BRUIT) n = n.replace(b, "");
  n = n
    .replace(/\b\d{1,2}[\/.]\d{1,2}([\/.]\d{2,4})?\b/g, " ") // dates
    .replace(/\b(DU|LE|AM|VOM)\b/g, " ")
    .replace(/[0-9]{3,}/g, " ") // références, numéros de carte
    .replace(/[^A-Z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const mots = n.split(" ").filter((w) => w.length >= 2);
  return mots.slice(0, 2).join(" ");
}

function joursEntre(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

function mediane(v: number[]) {
  const s = [...v].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function frequenceDepuisIntervalle(j: number): Frequence | null {
  if (j >= 5 && j <= 9) return "hebdomadaire";
  if (j >= 25 && j <= 36) return "mensuel";
  if (j >= 80 && j <= 100) return "trimestriel";
  if (j >= 350 && j <= 380) return "annuel";
  return null;
}

function joli(libelle: string): string {
  const cle = cleMarchand(libelle);
  const base = cle || normaliser(libelle).slice(0, 24);
  return base
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export function detecter(operations: Operation[]): FantomeDetecte[] {
  const candidates = operations.filter(
    (o) => o.sens !== "credit" && o.montant > 0 && o.montant <= MONTANT_MAX && !estExclu(o.libelle),
  );

  const groupes = new Map<string, Operation[]>();
  for (const o of candidates) {
    const cle = cleMarchand(o.libelle);
    if (!cle) continue;
    const g = groupes.get(cle) ?? [];
    g.push(o);
    groupes.set(cle, g);
  }

  const resultats: FantomeDetecte[] = [];
  for (const [cle, ops] of groupes) {
    ops.sort((a, b) => a.date.localeCompare(b.date));
    // Une seule opération par jour et par marchand (doublons d'import entre deux relevés)
    const uniques = ops.filter((o, i) => i === 0 || !(o.date === ops[i - 1].date && o.montant === ops[i - 1].montant));
    const marchand = trouverMarchand(uniques[0].libelle);
    const dernier = uniques[uniques.length - 1];

    let frequence: Frequence | null = null;
    if (uniques.length >= 2) {
      const intervalles = uniques.slice(1).map((o, i) => joursEntre(uniques[i].date, o.date));
      frequence = frequenceDepuisIntervalle(mediane(intervalles));
      // Les montants doivent rester proches (±25 %) pour un vrai abonnement
      const montants = uniques.map((o) => o.montant);
      const ecart = (Math.max(...montants) - Math.min(...montants)) / Math.max(...montants);
      if (ecart > 0.25 && !marchand) frequence = null;
      // Un commerce où l'on passe chaque semaine (boulangerie…) n'est pas un abonnement, sauf service connu
      if (frequence === "hebdomadaire" && !marchand) frequence = null;
      // Service connu mais dates irrégulières (deux moyens de paiement, relevés qui se chevauchent…)
      if (!frequence && marchand) frequence = marchand.frequence ?? "mensuel";
    } else if (marchand) {
      // Une seule apparition, mais c'est un service à abonnement connu
      frequence = marchand.frequence ?? "mensuel";
    }
    if (!frequence) continue;

    resultats.push({
      id: cle,
      nom: marchand?.nom ?? joli(dernier.libelle),
      libelleBanque: dernier.libelle.trim(),
      montant: dernier.montant,
      frequence,
      coutAnnuel: Math.round(dernier.montant * PAR_AN[frequence] * 100) / 100,
      occurrences: uniques.length,
      dernierPrelevement: dernier.date,
      connu: Boolean(marchand),
    });
  }

  return resultats.sort((a, b) => b.coutAnnuel - a.coutAnnuel);
}

export const LIBELLE_FREQUENCE: Record<Frequence, string> = {
  hebdomadaire: "chaque semaine",
  mensuel: "chaque mois",
  trimestriel: "chaque trimestre",
  annuel: "chaque année",
};
