"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fantome } from "@/components/Fantome";
import { etatAcces } from "@/app/actions/paiement";
import { EMAIL_CONTACT } from "@/lib/config";

type Etat = "attente" | "echec" | "lent";

export function Merci() {
  const router = useRouter();
  const sessionId = useSearchParams().get("session_id");
  const [etat, setEtat] = useState<Etat>("attente");

  // On attend la confirmation de Stripe (webhook) : quelques secondes au plus.
  useEffect(() => {
    let essais = 0;
    let fini = false;
    const verifier = async () => {
      if (fini) return;
      essais++;
      const r = await etatAcces(sessionId).catch(() => ({ ouvert: false, paiement: "inconnu" as const }));
      if (r.ouvert) {
        fini = true;
        try { sessionStorage.removeItem("fantomes.resultats"); } catch {}
        router.replace("/audit");
        return;
      }
      if (r.paiement === "echoue" || (r.paiement === "en_cours" && essais > 2)) { fini = true; setEtat("echec"); return; }
      if (essais >= 20) { fini = true; setEtat("lent"); return; }
      setTimeout(verifier, 1500);
    };
    verifier();
    return () => { fini = true; };
  }, [sessionId, router]);

  return (
    <main className="flex flex-1 items-center px-4 py-16">
      <div className="mx-auto max-w-xl text-center">
        {etat === "attente" && (
          <div role="status">
            <Fantome className="mx-auto h-14 w-14 animate-bounce text-billet" />
            <h1 className="font-titre mt-6 text-3xl font-extrabold leading-tight">Paiement reçu. On ouvre ton audit…</h1>
            <p className="mt-3 text-encre-douce">Quelques secondes, le temps que la banque confirme.</p>
          </div>
        )}
        {etat === "echec" && (
          <>
            <h1 className="font-titre text-3xl font-extrabold leading-tight">Le paiement n’est pas passé.</h1>
            <p className="mt-3 text-encre-douce">Aucun montant n’a été prélevé. Tu peux réessayer, avec la même carte ou une autre.</p>
            <Link href="/offre" className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white">
              Réessayer le paiement
            </Link>
          </>
        )}
        {etat === "lent" && (
          <>
            <h1 className="font-titre text-3xl font-extrabold leading-tight">Ton paiement est en cours de confirmation.</h1>
            <p className="mt-3 text-encre-douce">
              Ça prend plus longtemps que prévu. Recharge cette page dans une minute. Si rien ne change, écris à{" "}
              <strong className="break-all text-encre">{EMAIL_CONTACT}</strong> : on ouvre ton accès à la main.
            </p>
            <button type="button" onClick={() => location.reload()} className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-encre px-6 text-lg font-bold text-papier">
              Recharger
            </button>
          </>
        )}
      </div>
    </main>
  );
}
