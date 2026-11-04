"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Fantome } from "@/components/Fantome";
import { PiedDePage } from "@/components/PiedDePage";
import { Lettre } from "@/components/Lettre";
import { chargerAudit, changerStatut, lienResiliation, type AuditDebloque, type FantomeEnregistre } from "@/app/actions/audit";
import { LIBELLE_FREQUENCE } from "@/lib/detection";
import { EMAIL_CONTACT } from "@/lib/config";

const euros = (n: number, dec = false) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 });

export function Audit() {
  const [audit, setAudit] = useState<AuditDebloque | null>(null);

  useEffect(() => {
    chargerAudit().then(setAudit).catch(() => setAudit({ acces: false }));
  }, []);

  if (!audit) {
    return (
      <main className="flex flex-1 items-center justify-center" role="status">
        <Fantome className="h-10 w-10 animate-bounce text-billet" />
        <span className="sr-only">Chargement de ton audit…</span>
      </main>
    );
  }

  if (!audit.acces) {
    return (
      <main className="flex flex-1 items-center px-4 py-16">
        <div className="mx-auto max-w-xl">
          <Fantome className="h-12 w-12 text-encre" />
          <h1 className="font-titre mt-6 text-4xl font-extrabold leading-tight tracking-tight">Aucun audit débloqué sur cet appareil.</h1>
          <p className="mt-4 text-encre-douce">
            Si tu as payé depuis un autre téléphone ou un autre navigateur, ouvre Fantômes là-bas. Un souci ? Écris à{" "}
            <strong className="break-all text-encre">{EMAIL_CONTACT}</strong> avec l’e-mail utilisé pour payer : on règle ça.
          </p>
          <Link href="/analyse" className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white">
            Analyser un relevé
          </Link>
        </div>
      </main>
    );
  }

  return <AuditComplet initial={audit} />;
}

function AuditComplet({ initial }: { initial: Extract<AuditDebloque, { acces: true }> }) {
  const [fantomes, setFantomes] = useState(initial.fantomes);
  const [, demarrer] = useTransition();
  const [erreurPortail, setErreurPortail] = useState<string | null>(null);

  const total = fantomes.reduce((s, f) => s + f.coutAnnuel, 0);
  const economise = fantomes.filter((f) => f.statut === "cancelled").reduce((s, f) => s + f.coutAnnuel, 0);

  function statut(f: FantomeEnregistre, s: FantomeEnregistre["statut"]) {
    const nouveau = f.statut === s ? "detected" : s;
    setFantomes((l) => l.map((x) => (x.id === f.id ? { ...x, statut: nouveau } : x)));
    demarrer(async () => {
      try { await changerStatut(f.id, nouveau); } catch {
        setFantomes((l) => l.map((x) => (x.id === f.id ? { ...x, statut: f.statut } : x)));
      }
    });
  }

  async function resilier() {
    setErreurPortail(null);
    const r = await lienResiliation();
    if ("url" in r) location.href = r.url;
    else setErreurPortail(r.erreur);
  }

  return (
    <>
      <main className="flex-1 px-4 pb-16 pt-5">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2">
            <Fantome className="h-7 w-7 text-encre" />
            <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
          </Link>

          <h1 className="font-titre mt-7 text-[2.2rem] font-extrabold leading-[1.05] tracking-tight">Ton audit complet.</h1>

          {/* Total économisé, mis à jour à chaque résiliation */}
          <div className="ticket chiffres mt-6 px-6 py-6 shadow-[0_8px_30px_-12px_rgba(24,24,31,0.25)]">
            <div className="flex items-baseline justify-between gap-3">
              <span>Tes prélèvements réguliers</span>
              <span className="font-bold text-vermillon">{euros(total)}/an</span>
            </div>
            <div className="pointilles my-4" />
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">Économisé sur l’année</span>
              <span className="font-titre text-3xl font-extrabold text-billet">{euros(economise)}</span>
            </div>
            <p className="mt-2 text-sm text-encre-douce">
              {economise === 0
                ? "Marque un abonnement comme « Résilié » une fois ta lettre envoyée : le compteur se met à jour."
                : "Bien joué. Chaque fantôme arrêté, c’est de l’argent qui reste chez toi chaque mois."}
            </p>
          </div>

          <ol className="mt-8 space-y-4">
            {fantomes.map((f, i) => (
              <li key={f.id} className={`rounded-3xl border-2 bg-[#fffdf8] p-5 ${f.statut === "cancelled" ? "border-billet" : "border-encre/15"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="chiffres mt-1 text-sm font-bold text-encre-douce">{i + 1}</span>
                    <div>
                      <p className={`font-titre text-xl font-bold leading-tight ${f.statut === "cancelled" ? "line-through decoration-2" : ""}`}>{f.nom}</p>
                      <p className="text-sm text-encre-douce">{euros(f.montant, true)} {LIBELLE_FREQUENCE[f.frequence]}</p>
                      {f.libelleBanque && <p className="mt-1 break-words text-xs text-encre-douce/80">Sur ton relevé : {f.libelleBanque}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`chiffres font-titre text-2xl font-extrabold ${f.statut === "cancelled" ? "text-billet" : "text-vermillon"}`}>{euros(f.coutAnnuel)}</p>
                    <p className="text-xs text-encre-douce">par an</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => statut(f, "keep")}
                    aria-pressed={f.statut === "keep"}
                    className={`min-h-12 rounded-xl border-2 text-sm font-bold ${f.statut === "keep" ? "border-encre bg-encre text-papier" : "border-encre/20"}`}
                  >
                    Je le garde
                  </button>
                  <button
                    type="button"
                    onClick={() => statut(f, "cancelled")}
                    aria-pressed={f.statut === "cancelled"}
                    className={`min-h-12 rounded-xl border-2 text-sm font-bold ${f.statut === "cancelled" ? "border-billet bg-billet text-papier" : "border-billet/40 text-billet"}`}
                  >
                    {f.statut === "cancelled" ? "Résilié ✓" : "C’est résilié"}
                  </button>
                </div>
                {f.statut !== "keep" && f.statut !== "cancelled" && <Lettre service={f.nom} />}
              </li>
            ))}
          </ol>

          {initial.abonnement && (
            <section className="mt-10 rounded-2xl border border-encre/10 bg-[#fffdf8] px-5 py-5">
              <h2 className="font-bold">Ta veille</h2>
              <p className="mt-1 text-[0.95rem] text-encre-douce">Dépose un nouveau relevé quand tu veux pour attraper les nouveaux fantômes.</p>
              <Link href="/analyse" className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-encre px-4 font-bold text-papier">
                Nouvelle analyse
              </Link>
              <button type="button" onClick={resilier} className="mt-3 w-full py-2 text-sm font-bold text-encre-douce underline underline-offset-4">
                Résilier mon abonnement
              </button>
              {erreurPortail && <p role="alert" className="mt-2 text-sm">{erreurPortail}</p>}
            </section>
          )}
        </div>
      </main>
      <PiedDePage />
    </>
  );
}
