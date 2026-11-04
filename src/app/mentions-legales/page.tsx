import type { Metadata } from "next";
import { BlocVendeur, PageLegale } from "@/components/PageLegale";
import { VENDEUR } from "@/lib/config";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales">
      <section>
        <h2>Éditeur du site (Impressum)</h2>
        <p className="mt-2">Informations fournies conformément au § 5 du Digitale-Dienste-Gesetz (DDG, Allemagne).</p>
        <div className="mt-3">
          <BlocVendeur />
        </div>
      </section>

      <section>
        <h2>TVA</h2>
        <p className="mt-2">{VENDEUR.tva}</p>
      </section>

      <section>
        <h2>Responsable du contenu</h2>
        <p className="mt-2">{VENDEUR.nom}, adresse ci-dessus.</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p className="mt-2">
          Site hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Base de données hébergée par
          Supabase, dans un centre de données situé dans l’Union européenne (Irlande).
        </p>
      </section>

      <section>
        <h2>Règlement des litiges</h2>
        <p className="mt-2">
          Nous ne sommes ni tenus ni disposés à participer à une procédure de règlement des litiges devant un organisme de
          médiation de la consommation. Pour toute réclamation, écris-nous directement à{" "}
          <a href={`mailto:${VENDEUR.email}`}>{VENDEUR.email}</a> : on te répond sous 2 jours ouvrés.
        </p>
      </section>
    </PageLegale>
  );
}
