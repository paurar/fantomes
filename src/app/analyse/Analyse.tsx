"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Fantome } from "@/components/Fantome";
import { detecter, LIBELLE_FREQUENCE, type FantomeDetecte, type Operation } from "@/lib/detection";
import { lireFichier } from "@/lib/lecture";
import { operationsExemple } from "@/lib/exemple";
import { genererLettre, type InfosLettre } from "@/lib/lettre";

type Etat =
  | { etape: "depot"; erreur?: string }
  | { etape: "lecture" }
  | { etape: "resultats"; fantomes: FantomeDetecte[]; exemple: boolean };

const CLE_RESULTATS = "fantomes.resultats";

const euros = (n: number, decimales = true) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: decimales ? 2 : 0, maximumFractionDigits: decimales ? 2 : 0 });

function messageErreur(e: unknown): string {
  const code = e instanceof Error ? e.message : "";
  if (code === "PDF_IMAGE")
    return "Ce PDF est une photo ou un scan : on ne peut pas en lire le texte. Télécharge le relevé directement depuis l’appli ou l’espace client de ta banque.";
  if (code === "EXCEL") return "Les fichiers Excel ne sont pas encore pris en charge. Choisis plutôt l’export PDF ou CSV de ta banque.";
  return "On n’a pas réussi à lire ce fichier. Essaie le relevé PDF téléchargé depuis ta banque, ou l’export CSV.";
}

export function Analyse() {
  const [etat, setEtat] = useState<Etat>({ etape: "depot" });
  const champ = useRef<HTMLInputElement>(null);

  function terminer(ops: Operation[], exemple: boolean) {
    const fantomes = detecter(ops);
    try { sessionStorage.setItem(CLE_RESULTATS, JSON.stringify({ fantomes, exemple })); } catch { /* sans stockage, on continue */ }
    setEtat({ etape: "resultats", fantomes, exemple });
    window.scrollTo({ top: 0 });
  }

  async function analyser(fichiers: FileList | null) {
    if (!fichiers?.length) return;
    setEtat({ etape: "lecture" });
    try {
      const toutes: Operation[] = [];
      for (const f of Array.from(fichiers).slice(0, 6)) toutes.push(...(await lireFichier(f)));
      if (toutes.length === 0) throw new Error("VIDE");
      terminer(toutes, false);
    } catch (e) {
      setEtat({ etape: "depot", erreur: messageErreur(e) });
    } finally {
      if (champ.current) champ.current.value = "";
    }
  }

  return (
    <main className="flex flex-1 flex-col px-4 pb-12 pt-5">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/" className="inline-flex items-center gap-2">
          <Fantome className="h-7 w-7 text-encre" />
          <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
        </Link>

        {etat.etape === "resultats" ? (
          <AvantGout fantomes={etat.fantomes} exemple={etat.exemple} recommencer={() => setEtat({ etape: "depot" })} />
        ) : (
          <>
            <h1 className="font-titre mt-8 text-[2.1rem] font-extrabold leading-[1.08] tracking-tight">
              Dépose ton relevé, on débusque tes fantômes.
            </h1>
            <p className="mt-3 text-encre-douce">
              PDF ou CSV, tel que ta banque te le donne. <strong className="text-encre">Idéalement 3 mois</strong> : c’est ce qui
              revient d’un mois sur l’autre qui trahit un abonnement.
            </p>

            <input
              ref={champ}
              type="file"
              accept=".pdf,.csv,.txt,application/pdf,text/csv"
              multiple
              className="sr-only"
              id="releve"
              onChange={(e) => analyser(e.target.files)}
            />

            {etat.etape === "lecture" ? (
              <div className="mt-8 flex min-h-40 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-billet bg-billet-clair px-6 text-center" role="status">
                <Fantome className="h-10 w-10 animate-bounce text-billet" />
                <p className="mt-3 font-bold">Lecture de ton relevé…</p>
                <p className="text-sm text-encre-douce">Sur ton appareil. Rien n’est envoyé.</p>
              </div>
            ) : (
              <label
                htmlFor="releve"
                className="mt-8 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-encre/25 bg-[#fffdf8] px-6 text-center transition hover:border-vermillon"
              >
                <span className="flex min-h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white shadow-[0_4px_0_0_var(--color-vermillon-fonce)]">
                  Choisir mon relevé
                </span>
                <span className="mt-3 text-sm text-encre-douce">Tu peux en sélectionner plusieurs (un par mois).</span>
              </label>
            )}

            {etat.etape === "depot" && etat.erreur && (
              <p role="alert" className="mt-4 rounded-2xl border-2 border-vermillon/40 bg-vermillon/10 px-4 py-3 text-[0.95rem]">
                {etat.erreur}
              </p>
            )}

            <p className="mt-4 flex items-start gap-2 text-sm text-encre-douce">
              <span aria-hidden="true" className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-billet" />
              Ton relevé est lu sur ton appareil et ne quitte jamais ton téléphone. On ne voit ni ton solde, ni tes autres dépenses.
            </p>

            <details className="mt-6 rounded-2xl border border-encre/10 bg-[#fffdf8] px-4 py-3">
              <summary className="cursor-pointer font-bold">Où trouver mon relevé ?</summary>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[0.95rem] text-encre-douce">
                <li>Ouvre l’appli de ta banque (ou ton espace client sur internet).</li>
                <li>Va dans <strong>Comptes</strong>, puis <strong>Relevés</strong> ou <strong>e-Documents</strong>.</li>
                <li>Télécharge les relevés PDF des 3 derniers mois.</li>
                <li>Reviens ici et choisis-les.</li>
              </ol>
            </details>

            <button
              type="button"
              onClick={() => terminer(operationsExemple(), true)}
              className="mt-6 w-full rounded-2xl border-2 border-encre px-6 py-3.5 text-base font-bold"
            >
              Pas ton relevé sous la main ? Essayer avec un exemple
            </button>
          </>
        )}
      </div>
    </main>
  );
}

function AvantGout({ fantomes, exemple, recommencer }: { fantomes: FantomeDetecte[]; exemple: boolean; recommencer: () => void }) {
  if (fantomes.length === 0) {
    return (
      <div className="mt-8">
        <h1 className="font-titre text-[2.1rem] font-extrabold leading-[1.08] tracking-tight">Aucun fantôme repéré… pour l’instant.</h1>
        <p className="mt-3 text-encre-douce">
          Le plus souvent, c’est que le relevé ne couvre qu’un mois : un prélèvement doit apparaître au moins deux fois pour qu’on le reconnaisse.
          Ajoute les relevés de 2 ou 3 mois et relance.
        </p>
        <button type="button" onClick={recommencer} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white">
          Déposer d’autres relevés
        </button>
      </div>
    );
  }

  const total = fantomes.reduce((s, f) => s + f.coutAnnuel, 0);
  const [premier, ...suivants] = fantomes;

  return (
    <div className="mt-8">
      {exemple && (
        <p className="mb-4 inline-block rounded-full bg-papier-fonce px-3 py-1 text-sm font-bold text-encre-douce">Relevé d’exemple</p>
      )}
      <h1 className="font-titre text-[2.1rem] font-extrabold leading-[1.08] tracking-tight">
        {fantomes.length === 1 ? "1 prélèvement régulier" : `${fantomes.length} prélèvements réguliers`},{" "}
        <span className="whitespace-nowrap text-vermillon">{euros(Math.round(total), false)} par an.</span>
      </h1>
      <p className="mt-3 text-encre-douce">Classés du plus cher au moins cher, sur une année. Garde ce qui te sert, arrête le reste.</p>

      {/* Le premier fantôme : débloqué, avec sa lettre */}
      <article className="mt-7 rounded-3xl border-2 border-encre bg-[#fffdf8] p-5">
        <LigneFantome f={premier} rang={1} />
        <Lettre service={premier.nom} />
      </article>

      {/* La suite : visible, mais verrouillée */}
      {suivants.length > 0 && (
        <section aria-label="Fantômes verrouillés" className="mt-4 space-y-3">
          {suivants.map((f, i) => (
            <div key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-encre/10 bg-[#fffdf8] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="chiffres text-sm font-bold text-encre-douce">{i + 2}</span>
                <div>
                  <p aria-label="Nom masqué" className="select-none font-bold tracking-widest text-encre/30">●●●●●●●</p>
                  <p className="text-sm text-encre-douce">{LIBELLE_FREQUENCE[f.frequence]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="chiffres font-titre text-xl font-extrabold text-vermillon">{euros(f.coutAnnuel, false)}</p>
                <p className="text-xs text-encre-douce">par an</p>
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-encre px-5 py-6 text-papier">
            <p className="font-titre text-2xl font-bold leading-tight">
              Encore {suivants.length} {suivants.length === 1 ? "fantôme" : "fantômes"}, soit {euros(Math.round(total - premier.coutAnnuel), false)} par an.
            </p>
            <p className="mt-2 text-papier/80">Leurs noms, leurs lettres de résiliation prêtes, et le total de ce que tu économises, mis à jour.</p>
            <Link
              href="/offre"
              className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white"
            >
              Débloquer tout mon audit
            </Link>
          </div>
        </section>
      )}

      <button type="button" onClick={recommencer} className="mt-6 w-full py-3 text-center font-bold text-encre-douce underline underline-offset-4">
        {exemple ? "Essayer avec mon vrai relevé" : "Analyser un autre relevé"}
      </button>
    </div>
  );
}

function LigneFantome({ f, rang }: { f: FantomeDetecte; rang: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="chiffres mt-1 text-sm font-bold text-encre-douce">{rang}</span>
        <div>
          <p className="font-titre text-xl font-bold leading-tight">{f.nom}</p>
          <p className="text-sm text-encre-douce">
            {euros(f.montant)} {LIBELLE_FREQUENCE[f.frequence]}
          </p>
          <p className="mt-1 break-words text-xs text-encre-douce/80">Sur ton relevé : {f.libelleBanque}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="chiffres font-titre text-2xl font-extrabold text-vermillon">{euros(f.coutAnnuel, false)}</p>
        <p className="text-xs text-encre-douce">par an</p>
      </div>
    </div>
  );
}

function Lettre({ service }: { service: string }) {
  const [ouverte, setOuverte] = useState(false);
  const [infos, setInfos] = useState<InfosLettre>({ nom: "", adresse: "", ville: "", reference: "" });
  const [copie, setCopie] = useState(false);
  const texte = genererLettre(service, infos);

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  }

  if (!ouverte) {
    return (
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-billet px-6 text-lg font-bold text-papier"
      >
        Préparer ma lettre
      </button>
    );
  }

  const champ = "mt-1 w-full rounded-xl border-2 border-encre/15 bg-white px-3 py-3 text-base focus:border-billet focus:outline-none";
  return (
    <div className="mt-5 border-t border-encre/10 pt-5">
      <p className="font-bold">Ta lettre pour {service}</p>
      <div className="mt-3 grid gap-3">
        <label className="text-sm font-bold">Prénom et nom
          <input className={champ} autoComplete="name" value={infos.nom} onChange={(e) => setInfos({ ...infos, nom: e.target.value })} />
        </label>
        <label className="text-sm font-bold">Adresse
          <input className={champ} autoComplete="street-address" value={infos.adresse} onChange={(e) => setInfos({ ...infos, adresse: e.target.value })} />
        </label>
        <label className="text-sm font-bold">Ville
          <input className={champ} autoComplete="address-level2" value={infos.ville} onChange={(e) => setInfos({ ...infos, ville: e.target.value })} />
        </label>
        <label className="text-sm font-bold">N° client ou de contrat <span className="font-normal text-encre-douce">(si tu l’as)</span>
          <input className={champ} value={infos.reference} onChange={(e) => setInfos({ ...infos, reference: e.target.value })} />
        </label>
      </div>
      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-papier px-4 py-4 font-texte text-[0.9rem] leading-relaxed">{texte}</pre>
      <button
        type="button"
        onClick={copier}
        className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl bg-billet px-6 text-lg font-bold text-papier"
      >
        {copie ? "Lettre copiée ✓" : "Copier la lettre"}
      </button>
      <p className="mt-3 text-sm text-encre-douce">
        Astuce : beaucoup de services permettent de résilier en ligne depuis ton espace client. Sinon, envoie cette lettre par
        e-mail au service clients, ou en recommandé avec accusé de réception.
      </p>
    </div>
  );
}
