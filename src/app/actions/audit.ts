"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientServeur } from "@/lib/supabase/serveur";
import { stripe } from "@/lib/stripe";

export type FantomeEnregistre = {
  id: string;
  nom: string;
  libelleBanque: string;
  montant: number;
  frequence: "hebdomadaire" | "mensuel" | "trimestriel" | "annuel";
  coutAnnuel: number;
  statut: "detected" | "keep" | "to_cancel" | "cancelled";
};

export type AuditDebloque =
  | { acces: false }
  | { acces: true; plan: "audit" | "annuel" | "mensuel"; abonnement: boolean; fantomes: FantomeEnregistre[] };

/** Renvoie l'audit débloqué du visiteur, seulement s'il a un achat actif confirmé par Stripe. */
export async function chargerAudit(): Promise<AuditDebloque> {
  const supabase = await clientServeur();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { acces: false };

  const { data: achats } = await supabase
    .from("purchases")
    .select("plan, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (!achats?.length) return { acces: false };

  const abonnement = achats.find((a) => a.plan !== "audit");
  // Abonnement : le dernier audit. Achat unique : le dernier audit fait avant (ou au moment de) l'achat.
  let requete = supabase.from("audits").select("id").order("created_at", { ascending: false }).limit(1);
  if (!abonnement) requete = requete.lte("created_at", new Date(new Date(achats[0].created_at).getTime() + 60_000).toISOString());
  const { data: audits } = await requete;
  if (!audits?.length) return { acces: false };

  const { data: ghosts } = await supabase
    .from("ghosts")
    .select("id, name, bank_label, amount_cents, frequency, annual_cost_cents, status")
    .eq("audit_id", audits[0].id)
    .order("annual_cost_cents", { ascending: false });

  return {
    acces: true,
    plan: (abonnement ?? achats[0]).plan,
    abonnement: Boolean(abonnement),
    fantomes: (ghosts ?? []).map((g) => ({
      id: g.id,
      nom: g.name,
      libelleBanque: g.bank_label,
      montant: g.amount_cents / 100,
      frequence: g.frequency,
      coutAnnuel: g.annual_cost_cents / 100,
      statut: g.status,
    })),
  };
}

/** « Je garde » / « À résilier » / « Résilié » : alimente le total économisé. */
export async function changerStatut(idBrut: unknown, statutBrut: unknown) {
  const id = z.string().uuid().parse(idBrut);
  const statut = z.enum(["detected", "keep", "to_cancel", "cancelled"]).parse(statutBrut);
  const supabase = await clientServeur();
  const { error } = await supabase
    .from("ghosts")
    .update({ status: statut, cancelled_at: statut === "cancelled" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error("STATUT");
}

/** Lien vers l'espace Stripe où l'on résilie son abonnement en un clic. */
export async function lienResiliation(): Promise<{ url: string } | { erreur: string }> {
  const supabase = await clientServeur();
  const { data: achat } = await supabase
    .from("purchases")
    .select("stripe_customer_id")
    .in("plan", ["annuel", "mensuel"])
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!achat?.stripe_customer_id) return { erreur: "Aucun abonnement trouvé." };
  const h = await headers();
  const retour = (h.get("origin") ?? "") + "/audit";
  try {
    const s = await stripe().billingPortal.sessions.create({ customer: achat.stripe_customer_id, return_url: retour, locale: "fr" });
    return { url: s.url };
  } catch {
    return { erreur: "La page de résiliation n’est pas disponible pour le moment. Écris-nous, on s’en occupe." };
  }
}
