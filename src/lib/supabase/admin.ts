import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Client avec la clé secrète : contourne les règles de sécurité. Uniquement côté serveur (webhook Stripe). */
export function clientAdmin() {
  const cle = process.env.SUPABASE_SECRET_KEY;
  if (!cle) throw new Error("SUPABASE_SECRET_KEY manquante");
  if (cle.trim().startsWith("sb_publishable_")) throw new Error("SUPABASE_SECRET_KEY contient la clé publique (sb_publishable_) au lieu de la clé secrète (sb_secret_)");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cle.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
