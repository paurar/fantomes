import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { clientAdmin } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/config";

// Stripe appelle cette adresse après chaque paiement. C'est le SEUL endroit qui ouvre un accès :
// la signature prouve que l'appel vient bien de Stripe.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function statutAbonnement(s: Stripe.Subscription.Status) {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  return "canceled";
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  const db = clientAdmin();

  // Déjà traité ? (Stripe peut renvoyer le même événement plusieurs fois)
  const { data: deja } = await db.from("stripe_events").select("id").eq("id", event.id).maybeSingle();
  if (deja) return Response.json({ recu: true, doublon: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required") break;
        const userId = s.client_reference_id ?? s.metadata?.user_id;
        const plan = s.metadata?.plan;
        if (!userId || !UUID.test(userId) || !plan || !PLANS.includes(plan as never)) throw new Error("Métadonnées invalides");

        const { error } = await db.from("purchases").upsert(
          {
            user_id: userId,
            plan,
            status: "active",
            email: s.customer_details?.email ?? null,
            stripe_customer_id: typeof s.customer === "string" ? s.customer : s.customer?.id ?? null,
            stripe_checkout_session_id: s.id,
            stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : s.subscription?.id ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_checkout_session_id" },
        );
        if (error) throw error;
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const fin = sub.items?.data?.[0]?.current_period_end;
        const { error } = await db
          .from("purchases")
          .update({
            status: event.type === "customer.subscription.deleted" ? "canceled" : statutAbonnement(sub.status),
            current_period_end: fin ? new Date(fin * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        if (error) throw error;
        break;
      }

      case "charge.refunded": {
        // Remboursement (garantie) : on retrouve la session de paiement correspondante
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (!pi || !charge.refunded) break;
        const sessions = await stripe().checkout.sessions.list({ payment_intent: pi, limit: 1 });
        const session = sessions.data[0];
        if (session) {
          const { error } = await db
            .from("purchases")
            .update({ status: "refunded", updated_at: new Date().toISOString() })
            .eq("stripe_checkout_session_id", session.id);
          if (error) throw error;
        }
        break;
      }
    }
  } catch (e) {
    console.error("Webhook Stripe", event.type, e);
    // 500 : Stripe réessaiera automatiquement
    return new Response("Erreur de traitement", { status: 500 });
  }

  await db.from("stripe_events").insert({ id: event.id, type: event.type });
  return Response.json({ recu: true });
}
