import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit la session Supabase (compte anonyme) avant les pages qui en ont besoin.
export async function proxy(request: NextRequest) {
  let reponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (aPoser) => {
          aPoser.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          aPoser.forEach(({ name, value, options }) => reponse.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getUser();
  return reponse;
}

export const config = {
  matcher: ["/offre/:path*", "/merci/:path*", "/audit/:path*"],
};
