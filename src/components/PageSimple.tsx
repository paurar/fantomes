import Link from "next/link";
import { Fantome } from "@/components/Fantome";
import { PiedDePage } from "@/components/PiedDePage";

export function PageSimple({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 px-4 pb-16 pt-6">
        <div className="mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2">
            <Fantome className="h-7 w-7 text-encre" />
            <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
          </Link>
          <h1 className="font-titre mt-10 text-4xl font-extrabold leading-tight tracking-tight">{titre}</h1>
          <div className="mt-5 space-y-4 text-encre-douce">{children}</div>
        </div>
      </main>
      <PiedDePage />
    </>
  );
}

export function RetourAccueil({ texte = "Revenir à l’accueil" }: { texte?: string }) {
  return (
    <Link
      href="/"
      className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-encre px-6 text-lg font-bold text-papier"
    >
      {texte}
    </Link>
  );
}
