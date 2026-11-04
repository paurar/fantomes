import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client Supabase agissant au nom du visiteur (ses cookies de session). Soumis aux règles de sécurité. */
export async function clientServeur() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (aPoser) => {
          try {
            aPoser.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Appelé depuis un composant serveur : le proxy se charge de rafraîchir la session.
          }
        },
      },
    },
  );
}
