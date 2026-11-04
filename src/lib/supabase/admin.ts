import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Client avec la clé secrète : contourne les règles de sécurité. Uniquement côté serveur (webhook Stripe). */
export function clientAdmin() {
  const cle = process.env.SUPABASE_SECRET_KEY;
  if (!cle) throw new Error("SUPABASE_SECRET_KEY manquante");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
