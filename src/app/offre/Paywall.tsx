"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Fantome } from "@/components/Fantome";
import { PiedDePage } from "@/components/PiedDePage";
import { clientNavigateur } from "@/lib/supabase/navigateur";
import { creerPaiement, etatAcces, preparerAudit } from "@/app/actions/paiement";
import { EMAIL_CONTACT, FORMULES, GARANTIE_JOURS, type Plan } from "@/lib/config";
import { lireReponses } from "@/lib/questionnaire";
import type { FantomeDetecte } from "@/lib/detection";

const cleStripe = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = cleStripe ? loadStripe(cleStripe) : null;

const euros = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

type Resultats = { fantomes: FantomeDetecte[]; exemple: boolean };

const abonner = () => () => {};
const lireBrut = () => {
  try { return sessionStorage.getItem("fantomes.resultats") ?? "null"; } catch { return "null"; }
};
const lireServeur = () => "pending";

export function Paywall() {
  const brut = useSyncExternalStore(abonner, lireBrut, lireServeur);
  if (brut === "pending") return <main className="flex-1" />;
  const resultats = JSON.parse(brut) as Resultats | null;

  if (!resultats || resultats.fantomes.length === 0) {
    return (
      <EtatSimple
        titre="Commence par analyser ton relevé."
        texte="L’audit se débloque une fois tes fantômes trouvés. Ça prend deux minutes, et c’est gratuit."
        bouton="Analyser mon relevé"
      />
    );
  }
  if (resultats.exemple) {
    return (
      <EtatSimple
        titre="Là, c’était le relevé d’exemple."
        texte="Pour débloquer tes fantômes à toi, analyse d’abord ton vrai relevé. Il ne quitte jamais ton téléphone."
        bouton="Analyser mon vrai relevé"
      />
    );
  }
  return <Offre fantomes={resultats.fantomes} />;
}

function Offre({ fantomes }: { fantomes: FantomeDetecte[] }) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>("annuel");
  const [auditId, setAuditId] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const total = useMemo(() => fantomes.reduce((s, f) => s + f.coutAnnuel, 0), [fantomes]);

  // 1. Session anonyme (pas de compte à créer) puis enregistrement de l'audit
  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const supabase = clientNavigateur();
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }
        const { auditId } = await preparerAudit({
          fantomes: fantomes.map((f) => ({
            nom: f.nom,
            libelleBanque: f.libelleBanque.slice(0, 200),
            montant: f.montant,
            frequence: f.frequence,
            dernierPrelevement: f.dernierPrelevement,
          })),
          reponses: lireReponses() ?? {},
        });
        if (annule) return;
        // Déjà abonné·e ? La nouvelle analyse est incluse : on l'ouvre directement.
        const acces = await etatAcces(null);
        if (acces.ouvert) {
          try { sessionStorage.removeItem("fantomes.resultats"); } catch {}
          router.replace("/audit");
          return;
        }
        setAuditId(auditId);
      } catch {
        if (!annule) setErreur("Le paiement n’a pas pu se préparer. Recharge la page ; si ça continue, écris-nous.");
      }
    })();
    return () => { annule = true; };
  }, [fantomes, router]);

  const fetchClientSecret = useCallback(async () => {
    const { clientSecret } = await creerPaiement(plan, auditId);
    return clientSecret;
  }, [plan, auditId]);

  const f = FORMULES[plan];

  return (
    <>
      <main className="flex-1 px-4 pb-16 pt-5">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2">
            <Fantome className="h-7 w-7 text-encre" />
            <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
          </Link>

          {/* 1. Ce qui a été fait pour la personne */}
          <h1 className="font-titre mt-7 text-[2.3rem] font-extrabold leading-[1.05] tracking-tight">Voilà ton plan, prêt.</h1>
          <p className="mt-3 text-lg text-encre-douce">
            On a trouvé <strong className="text-encre">{fantomes.length} prélèvements réguliers</strong> sur ton relevé, classés du plus cher
            au moins cher. Leurs lettres de résiliation sont rédigées. Il ne reste qu’à les débloquer.
          </p>

          {/* Garantie, visible sans défiler */}
          <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-billet-clair px-4 py-3 text-[0.95rem]">
            <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-billet text-xs font-bold text-papier">✓</span>
            <span><strong>Satisfait ou remboursé {GARANTIE_JOURS} jours.</strong> Un simple e-mail suffit, sans justification.</span>
          </p>

          {/* 2. Ce que ça économise, comparé au prix */}
          <div className="ticket chiffres mt-6 px-6 py-6 shadow-[0_8px_30px_-12px_rgba(24,24,31,0.25)]">
            <div className="flex items-baseline justify-between gap-3">
              <span>Ce que tes prélèvements te coûtent</span>
              <span className="font-titre text-2xl font-extrabold text-vermillon">{euros(total)}/an</span>
            </div>
            <div className="pointilles my-4" />
            <div className="flex items-baseline justify-between gap-3">
              <span>L’audit complet</span>
              <span className="font-titre text-2xl font-extrabold text-billet">19 €</span>
            </div>
            {total > 19 && (
              <p className="mt-3 text-sm text-encre-douce">
                Arrêter un seul de ces prélèvements suffit à rembourser l’audit.
              </p>
            )}
          </div>

          {/* 3. Les formules */}
          <h2 className="font-titre mt-9 text-2xl font-bold">Choisis ta formule</h2>
          <div role="radiogroup" aria-label="Formules" className="mt-4 space-y-3">
            {(["audit", "annuel", "mensuel"] as Plan[]).map((p) => {
              const fo = FORMULES[p];
              const actif = plan === p;
              const misEnAvant = p === "annuel";
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={actif}
                  onClick={() => setPlan(p)}
                  className={`relative w-full rounded-2xl border-2 px-5 py-4 text-left transition ${
                    actif ? "border-encre bg-[#fffdf8] shadow-[0_4px_0_0_var(--color-encre)]" : "border-encre/15 bg-[#fffdf8]"
                  } ${misEnAvant ? "mt-5" : ""}`}
                >
                  {misEnAvant && (
                    <span className="absolute -top-3 left-4 rounded-full bg-vermillon px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                      Recommandé
                    </span>
                  )}
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex items-start gap-3">
                      <span aria-hidden="true" className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${actif ? "border-[6px] border-encre" : "border-encre/30"}`} />
                      <span>
                        <span className="block font-bold">{fo.nom}</span>
                        <span className="mt-0.5 block text-sm text-encre-douce">{fo.detail}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="chiffres font-titre block text-2xl font-extrabold">{fo.prixCents / 100} €</span>
                      <span className="block text-xs text-encre-douce">{fo.periode}</span>
                    </span>
                  </span>
                  <span className="chiffres mt-2 block pl-8 text-sm font-bold text-billet">
                    {fo.parMois} · {fo.parJour}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4. La garantie, en clair */}
          <section aria-labelledby="garantie" className="mt-6 rounded-2xl border-2 border-billet/40 bg-[#fffdf8] px-5 py-4">
            <h3 id="garantie" className="font-bold">Garantie satisfait ou remboursé — {GARANTIE_JOURS} jours</h3>
            <p className="mt-1 text-[0.95rem] text-encre-douce">
              Pendant {GARANTIE_JOURS} jours après ton paiement, écris à <strong className="break-all text-encre">{EMAIL_CONTACT}</strong> avec
              l’e-mail utilisé pour payer. On te rembourse en entier, sans question, sous 2 jours ouvrés. L’argent apparaît
              ensuite sur ton compte en 5 à 10 jours, selon ta banque.
            </p>
          </section>

          {/* 5 + 6. Sans engagement, puis le paiement sur le même écran */}
          <div className="mt-8" id="paiement">
            <p className="flex items-center justify-center gap-2 text-center font-bold">
              <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-billet" />
              {f.mode === "payment" ? "Paiement unique, rien d’autre ne sera prélevé." : "Sans engagement, résiliable à tout moment."}
            </p>
            <div className="mt-4 min-h-[420px] overflow-hidden rounded-2xl bg-white">
              {erreur ? (
                <p role="alert" className="p-6 text-center">{erreur}</p>
              ) : !stripePromise ? (
                <p className="p-6 text-center text-encre-douce">Le paiement ouvre très bientôt.</p>
              ) : !auditId ? (
                <div className="flex min-h-[420px] items-center justify-center" role="status">
                  <Fantome className="h-10 w-10 animate-bounce text-billet" />
                  <span className="sr-only">Préparation du paiement…</span>
                </div>
              ) : (
                <EmbeddedCheckoutProvider key={plan} stripe={stripePromise} options={{ fetchClientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )}
            </div>
            <p className="mt-3 text-center text-sm text-encre-douce">Paiement sécurisé par Stripe. Fantômes ne voit jamais ta carte.</p>
          </div>

          {/* 7. Les quatre vraies objections */}
          <section aria-labelledby="faq" className="mt-12">
            <h2 id="faq" className="font-titre text-2xl font-bold">Questions fréquentes</h2>
            <div className="mt-4 divide-y divide-encre/10 rounded-2xl border border-encre/10 bg-[#fffdf8]">
              <Question q="Est-ce que ça marche pour mon cas ?">
                Si tu paies au moins un abonnement par prélèvement ou par carte, oui. Tu as déjà vu le résultat sur ton propre relevé avant
                de payer : ce que tu débloques, c’est exactement cette liste. Et si elle ne t’aide pas, la garantie te rembourse.
              </Question>
              <Question q="Combien de temps ça me prend ?">
                L’analyse est faite. Ensuite, compte deux à cinq minutes par abonnement à arrêter : la lettre est déjà rédigée,
                il te reste à la compléter et à l’envoyer.
              </Question>
              <Question q="Qu’est-ce qui se passe si je veux arrêter ?">
                L’audit complet est un paiement unique : rien d’autre ne sera jamais prélevé. Les veilles se résilient en un clic depuis
                ton espace, à tout moment, et tu gardes l’accès jusqu’à la fin de la période déjà payée.
              </Question>
              <Question q="À quoi sert exactement ce que je paie ?">
                À voir le nom de chacun de tes prélèvements réguliers, à obtenir une lettre de résiliation prête pour chacun, et à suivre
                ce que tu économises à mesure que tu les arrêtes. Avec une veille, tu peux en plus relancer une analyse à chaque nouveau relevé.
              </Question>
            </div>
          </section>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}

function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
        {q}
        <span aria-hidden="true" className="text-xl transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-2 text-encre-douce">{children}</p>
    </details>
  );
}

function EtatSimple({ titre, texte, bouton }: { titre: string; texte: string; bouton: string }) {
  return (
    <main className="flex flex-1 items-center px-4 py-16">
      <div className="mx-auto max-w-xl">
        <Fantome className="h-12 w-12 text-encre" />
        <h1 className="font-titre mt-6 text-4xl font-extrabold leading-tight tracking-tight">{titre}</h1>
        <p className="mt-4 text-encre-douce">{texte}</p>
        <Link href="/analyse" className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white">
          {bouton}
        </Link>
      </div>
    </main>
  );
}
