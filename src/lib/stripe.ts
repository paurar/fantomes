import "server-only";
import Stripe from "stripe";

let instance: Stripe | null = null;

export function stripe() {
  if (!instance) {
    const cle = process.env.STRIPE_SECRET_KEY;
    if (!cle) throw new Error("STRIPE_SECRET_KEY manquante");
    instance = new Stripe(cle);
  }
  return instance;
}
