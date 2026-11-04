"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientServeur } from "@/lib/supabase/serveur";
import { stripe } from "@/lib/stripe";
import { FORMULES, PLANS, type Plan } from "@/lib/config";

// ---------- Validation des entrées (tout ce qui vient du navigateur est vérifié ici) ----------

const schemaFantome = z.object({
  nom: z.string().trim().min(1).max(120),
  libelleBanque: z.string().max(200).default(""),
  montant: z.number().positive().max(1000),
  frequence: z.enum(["hebdomadaire", "mensuel", "trimestriel", "annuel"]),
  dernierPrelevement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const schemaAudit = z.object({
  fantomes: z.array(schemaFantome).min(1).max(80),
  reponses: z.record(z.string().max(20), z.string().max(20)).default({}),
});

const PAR_AN = { hebdomadaire: 52, mensuel: 12, trimestriel: 4, annuel: 1 } as const;

async function utilisateur() {
  const supabase = await clientServeur();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("SESSION");
  return { supabase, user: data.user };
}

/** Enregistre l'audit (les fantômes détectés) du visiteur, avant le paiement. */
export async function preparerAudit(entree: unknown): Promise<{ auditId: string }> {
  const donnees = schemaAudit.parse(entree);
  const { supabase, user } = await utilisateur();

  const { data: audit, error } = await supabase
    .from("audits")
    .insert({ user_id: user.id, answers: donnees.reponses })
    .select("id")
    .single();
  if (error || !audit) throw new Error("AUDIT");

  const lignes = donnees.fantomes.map((f) => {
    const montantCents = Math.round(f.montant * 100);
    return {
      audit_id: audit.id,
      user_id: user.id,
      name: f.nom,
      bank_label: f.libelleBanque,
      amount_cents: montantCents,
      frequency: f.frequence,
      annual_cost_cents: montantCents * PAR_AN[f.frequence], // recalculé côté serveur
      last_charge_date: f.dernierPrelevement ?? null,
    };
  });
  const { error: e2 } = await supabase.from("ghosts").insert(lignes);
  if (e2) throw new Error("FANTOMES");

  return { auditId: audit.id };
}

async function origine() {
  const h = await headers();
  const o = h.get("origin");
  if (o && /^https?:\/\//.test(o)) return o;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/** Crée la session de paiement Stripe intégrée à la page. Le prix est fixé ici, jamais par le navigateur. */
export async function creerPaiement(planBrut: unknown, auditIdBrut: unknown): Promise<{ clientSecret: string }> {
  const plan = z.enum(PLANS as [Plan, ...Plan[]]).parse(planBrut);
  const auditId = z.string().uuid().parse(auditIdBrut);
  const { supabase, user } = await utilisateur();

  // L'audit doit appartenir à ce visiteur (règles de sécurité Supabase)
  const { data: audit } = await supabase.from("audits").select("id").eq("id", auditId).single();
  if (!audit) throw new Error("AUDIT");

  const f = FORMULES[plan];
  const metadata = { user_id: user.id, plan, audit_id: auditId };
  const base = {
    ui_mode: "embedded_page" as const,
    locale: "fr" as const,
    client_reference_id: user.id,
    metadata,
    return_url: `${await origine()}/merci?session_id={CHECKOUT_SESSION_ID}`,
  };

  const session =
    f.mode === "payment"
      ? await stripe().checkout.sessions.create({
          ...base,
          mode: "payment",
          customer_creation: "always",
          payment_intent_data: { metadata },
          line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: f.prixCents, product_data: { name: `Fantômes — ${f.nom}` } } }],
        })
      : await stripe().checkout.sessions.create({
          ...base,
          mode: "subscription",
          subscription_data: { metadata },
          line_items: [{
            quantity: 1,
            price_data: { currency: "eur", unit_amount: f.prixCents, recurring: { interval: f.intervalle }, product_data: { name: `Fantômes — ${f.nom}` } },
          }],
        });

  if (!session.client_secret) throw new Error("STRIPE");
  return { clientSecret: session.client_secret };
}

/** Après le paiement : l'accès est-il ouvert ? (Seul le webhook Stripe ouvre l'accès.) */
export async function etatAcces(sessionIdBrut: unknown): Promise<{ ouvert: boolean; paiement: "complet" | "en_cours" | "echoue" | "inconnu" }> {
  const { supabase } = await utilisateur().catch(() => ({ supabase: null }));
  if (!supabase) return { ouvert: false, paiement: "inconnu" };

  const { data: achats } = await supabase.from("purchases").select("id").eq("status", "active").limit(1);
  if (achats?.length) return { ouvert: true, paiement: "complet" };

  const sessionId = z.string().startsWith("cs_").max(200).safeParse(sessionIdBrut);
  if (!sessionId.success) return { ouvert: false, paiement: "inconnu" };
  try {
    const s = await stripe().checkout.sessions.retrieve(sessionId.data);
    if (s.status === "complete") return { ouvert: false, paiement: "complet" }; // le webhook arrive
    if (s.status === "expired") return { ouvert: false, paiement: "echoue" };
    return { ouvert: false, paiement: "en_cours" };
  } catch {
    return { ouvert: false, paiement: "inconnu" };
  }
}
