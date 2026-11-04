import Link from "next/link";

export function PiedDePage() {
  return (
    <footer className="mt-auto border-t border-encre/10 px-4 py-8 text-sm text-encre-douce">
      <div className="mx-auto flex max-w-xl flex-col gap-4 md:max-w-3xl">
        <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/mentions-legales" className="underline-offset-4 hover:underline">Mentions légales</Link>
          <Link href="/cgv" className="underline-offset-4 hover:underline">Conditions de vente</Link>
          <Link href="/confidentialite" className="underline-offset-4 hover:underline">Confidentialité</Link>
        </nav>
        <p>© 2026 Fantômes. Ton relevé reste sur ton appareil.</p>
      </div>
    </footer>
  );
}
