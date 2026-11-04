"use client";

import Link from "next/link";

export default function Erreur({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center px-4 py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="font-titre text-4xl font-extrabold leading-tight tracking-tight">Oups, quelque chose a coincé.</h1>
        <p className="mt-4 text-encre-douce">Ce n’est pas de ta faute. Tu peux réessayer, ou revenir à l’accueil.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white"
        >
          Réessayer
        </button>
        <Link href="/" className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-encre px-6 text-lg font-bold">
          Revenir à l’accueil
        </Link>
      </div>
    </main>
  );
}
