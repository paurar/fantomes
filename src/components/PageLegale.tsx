import Link from "next/link";
import { Fantome } from "@/components/Fantome";
import { PiedDePage } from "@/components/PiedDePage";
import { VENDEUR } from "@/lib/config";

export function PageLegale({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 px-4 pb-16 pt-6">
        <article className="mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2">
            <Fantome className="h-7 w-7 text-encre" />
            <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
          </Link>
          <h1 className="font-titre mt-10 text-[2.2rem] font-extrabold leading-tight tracking-tight">{titre}</h1>
          <p className="mt-2 text-sm text-encre-douce">Dernière mise à jour : {VENDEUR.miseAJour}</p>
          <div className="mt-8 space-y-8 text-[1rem] leading-relaxed text-encre-douce [&_a]:text-encre [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-titre [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-encre [&_li]:mt-1.5 [&_p+p]:mt-3 [&_strong]:text-encre [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <PiedDePage />
    </>
  );
}

export function BlocVendeur() {
  return (
    <p>
      <strong>{VENDEUR.nom}</strong>
      <br />
      {VENDEUR.activite}
      <br />
      {VENDEUR.adresse}
      <br />
      {VENDEUR.ville}, {VENDEUR.pays}
      <br />
      E-mail : <a href={`mailto:${VENDEUR.email}`}>{VENDEUR.email}</a>
      {VENDEUR.telephone && (
        <>
          <br />
          Téléphone : {VENDEUR.telephone}
        </>
      )}
    </p>
  );
}
