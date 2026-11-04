"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QUESTIONS, sauverReponses, type Reponses } from "@/lib/questionnaire";
import { Fantome } from "@/components/Fantome";

export function Questions() {
  const router = useRouter();
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({});
  const question = QUESTIONS[etape];
  const total = QUESTIONS.length;

  function choisir(valeur: string) {
    const suite = { ...reponses, [question.id]: valeur };
    setReponses(suite);
    if (etape + 1 < total) {
      setEtape(etape + 1);
      window.scrollTo({ top: 0 });
    } else {
      sauverReponses(suite);
      router.push("/resultat");
    }
  }

  return (
    <main className="flex flex-1 flex-col px-4 pb-10 pt-5">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        {/* En-tête : retour + progression */}
        <div className="flex items-center gap-3">
          {etape === 0 ? (
            <Link href="/" aria-label="Revenir à l’accueil" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full">
              <Fantome className="h-7 w-7 text-encre" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setEtape(etape - 1)}
              aria-label="Question précédente"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-2xl"
            >
              ←
            </button>
          )}
          <div className="flex-1">
            <div
              className="h-2.5 overflow-hidden rounded-full bg-papier-fonce"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={etape + 1}
              aria-label={`Question ${etape + 1} sur ${total}`}
            >
              <div
                className="h-full rounded-full bg-billet transition-[width] duration-300"
                style={{ width: `${((etape + 1) / total) * 100}%` }}
              />
            </div>
          </div>
          <span className="chiffres text-sm font-bold text-encre-douce">{etape + 1}/{total}</span>
        </div>

        {/* La question */}
        <div key={question.id} className="mt-10 flex flex-1 flex-col">
          <h1 className="font-titre text-[2rem] font-extrabold leading-[1.1] tracking-tight">{question.titre}</h1>
          <p className="mt-3 text-encre-douce">{question.aide}</p>

          <ul className="mt-auto space-y-3 pt-10">
            {question.choix.map((c) => {
              const actif = reponses[question.id] === c.valeur;
              return (
                <li key={c.valeur}>
                  <button
                    type="button"
                    onClick={() => choisir(c.valeur)}
                    className={`flex min-h-14 w-full items-center rounded-2xl border-2 px-5 text-left text-lg font-bold transition active:scale-[0.99] ${
                      actif ? "border-billet bg-billet-clair" : "border-encre/15 bg-[#fffdf8] hover:border-encre/40"
                    }`}
                  >
                    {c.libelle}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </main>
  );
}
