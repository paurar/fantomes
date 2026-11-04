"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Fantome } from "@/components/Fantome";
import { PiedDePage } from "@/components/PiedDePage";
import { MONTANT_MOYEN_OUBLI, estimer, euros, lireReponses, phrasesPersonnalisees, type Reponses } from "@/lib/questionnaire";

// Lecture des réponses sans décalage entre serveur et navigateur
const abonner = () => () => {};
const lireBrut = () => JSON.stringify(lireReponses());
const lireServeur = () => "pending";

export function Resultat() {
  const brut = useSyncExternalStore(abonner, lireBrut, lireServeur);
  if (brut === "pending") return <main className="flex-1" />;
  const reponses = JSON.parse(brut) as Reponses | null;

  if (!reponses) return <EtatVide />;

  const e = estimer(reponses);
  const phrases = phrasesPersonnalisees(reponses);

  return (
    <>
      <main className="flex-1 px-4 pb-32 pt-5 md:pb-16">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2">
            <Fantome className="h-7 w-7 text-encre" />
            <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-encre-douce">Ton estimation</p>
          <h1 className="font-titre mt-2 text-[2.2rem] font-extrabold leading-[1.08] tracking-tight">
            Tes fantômes te coûtent probablement{" "}
            <span className="whitespace-nowrap text-vermillon">{euros(e.parAn)} par an.</span>
          </h1>

          {/* Ses réponses, avec ses mots */}
          <ul className="mt-6 space-y-2.5">
            {phrases.map((p) => (
              <li key={p} className="flex gap-3">
                <Fantome className="mt-1 h-5 w-5 shrink-0 text-vermillon" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          {/* Le calcul, transparent */}
          <div className="ticket chiffres mt-8 px-6 py-7 shadow-[0_8px_30px_-12px_rgba(24,24,31,0.25)]">
            <div className="flex items-baseline justify-between gap-3">
              <span>Abonnements probablement oubliés</span>
              <span className="font-bold">{e.fantomes}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3">
              <span>Par mois</span>
              <span className="font-bold">{euros(e.parMois)}</span>
            </div>
            <div className="pointilles my-4" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">Par an</span>
              <span className="font-titre text-3xl font-extrabold text-vermillon">{euros(e.parAn)}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3 text-encre-douce">
              <span>Si rien ne change, sur 3 ans</span>
              <span className="font-bold">{euros(e.surTroisAns)}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-encre-douce">
            Estimation à partir de tes réponses, sur une base de {MONTANT_MOYEN_OUBLI}&nbsp;€ par mois et par abonnement oublié.
            Le vrai chiffre est sur ton relevé — il peut être plus bas, ou plus haut.
          </p>

          {/* Ce que Fantômes change */}
          <h2 className="font-titre mt-10 text-2xl font-bold">Ce que Fantômes change</h2>
          <ul className="mt-4 space-y-4">
            <Change titre="Le chiffre exact, en 2 minutes">Tu déposes ton relevé, on repère chaque prélèvement qui revient.</Change>
            <Change titre="Le plus cher en premier">Classés par ce qu’ils te coûtent à l’année, pas au mois.</Change>
            <Change titre="Une lettre prête pour chacun">Tu gardes ce qui te sert. Le reste, tu l’arrêtes en un envoi.</Change>
          </ul>

          <div className="mt-10 hidden md:block">
            <BoutonSuite />
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-encre/10 bg-papier/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-sm md:hidden">
        <BoutonSuite />
      </div>
      <PiedDePage />
    </>
  );
}

function Change({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-billet text-sm font-bold text-papier">✓</span>
      <div>
        <p className="font-bold">{titre}</p>
        <p className="text-encre-douce">{children}</p>
      </div>
    </li>
  );
}

function BoutonSuite() {
  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/analyse"
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white shadow-[0_4px_0_0_var(--color-vermillon-fonce)] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-vermillon-fonce)]"
      >
        Trouver mes vrais fantômes
      </Link>
      <p className="mt-2 text-center text-sm text-encre-douce">Gratuit · ton relevé ne quitte jamais ton téléphone</p>
    </div>
  );
}

function EtatVide() {
  return (
    <main className="flex flex-1 items-center px-4 py-16">
      <div className="mx-auto max-w-xl">
        <Fantome className="h-12 w-12 text-encre" />
        <h1 className="font-titre mt-6 text-4xl font-extrabold leading-tight tracking-tight">Il nous manque tes réponses.</h1>
        <p className="mt-4 text-encre-douce">3 questions, une minute, et on te montre ce que tes abonnements oubliés te coûtent.</p>
        <Link
          href="/commencer"
          className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white"
        >
          Répondre aux 3 questions
        </Link>
      </div>
    </main>
  );
}
