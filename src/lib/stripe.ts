import "server-only";
import Stripe from "stripe";

let instance: Stripe | null = null;

export function stripe() {
  if (!instance) {
    const cle = process.env.STRIPE_SECRET_KEY;
    if (!cle) throw new Error("STRIPE_SECRET_KEY manquante");
    if (!/^(sk|rk)_(test|live)_/.test(cle.trim())) {
      // Erreur fréquente : la clé publique (pk_…) collée à la place de la clé secrète
      console.error(`[stripe] STRIPE_SECRET_KEY commence par « ${cle.trim().slice(0, 8)} » au lieu de « sk_test_ » ou « sk_live_ ».`);
      throw new Error("STRIPE_SECRET_KEY invalide");
    }
    instance = new Stripe(cle.trim());
  }
  return instance;
}
