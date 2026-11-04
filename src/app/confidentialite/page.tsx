import type { Metadata } from "next";
import { BlocVendeur, PageLegale } from "@/components/PageLegale";
import { VENDEUR } from "@/lib/config";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité">
      <section>
        <h2>L’essentiel</h2>
        <ul>
          <li><strong>Ton relevé bancaire ne quitte jamais ton appareil.</strong> Il est lu dans ton navigateur ; ni le fichier, ni ton solde, ni tes autres dépenses ne nous sont envoyés.</li>
          <li>On enregistre seulement la liste des prélèvements réguliers trouvés, quand tu passes au paiement.</li>
          <li>Pas de cookie publicitaire, pas de revente de données, pas de bandeau à accepter.</li>
        </ul>
      </section>

      <section>
        <h2>1. Responsable du traitement</h2>
        <div className="mt-2"><BlocVendeur /></div>
      </section>

      <section>
        <h2>2. Ce que nous traitons, et pourquoi</h2>
        <p className="mt-2"><strong>Ton relevé bancaire</strong> : analysé uniquement sur ton appareil. Il n’est ni transmis, ni stocké par nous.</p>
        <p>
          <strong>Tes réponses aux 3 questions et le résultat de l’analyse</strong> : gardés dans ton navigateur (stockage de
          session), effacés quand tu fermes l’onglet.
        </p>
        <p>
          <strong>Ton audit</strong> (nom des services détectés, libellé tel qu’il apparaît sur ton relevé, montant, fréquence,
          coût annuel, statut « gardé » ou « résilié »), rattaché à un identifiant anonyme : enregistré quand tu ouvres l’écran de
          paiement, pour pouvoir te livrer l’audit complet. Base légale : exécution du contrat (art. 6, 1, b RGPD).
        </p>
        <p>
          <strong>Ton achat</strong> (formule, adresse e-mail, identifiants de paiement Stripe, statut) : pour fournir le service,
          gérer la garantie et les remboursements (art. 6, 1, b RGPD) et respecter nos obligations comptables (art. 6, 1, c RGPD).
        </p>
        <p>
          <strong>Les coordonnées saisies dans une lettre de résiliation</strong> (nom, adresse) : gardées uniquement dans ton
          navigateur pour ne pas avoir à les retaper. Elles ne nous sont pas envoyées.
        </p>
        <p>
          <strong>Mesure d’audience</strong> : statistiques de visite anonymes et agrégées (Vercel Web Analytics), sans cookie et
          sans suivi d’une visite à l’autre, pour savoir combien de visiteurs vont jusqu’au bout. Base légale : intérêt légitime
          (art. 6, 1, f RGPD).
        </p>
        <p>
          <strong>Journaux techniques</strong> (adresse IP, date, page demandée) : conservés brièvement par notre hébergeur pour la
          sécurité et le bon fonctionnement du site (art. 6, 1, f RGPD).
        </p>
      </section>

      <section>
        <h2>3. Cookies et stockage local</h2>
        <p className="mt-2">
          Nous utilisons uniquement ce qui est nécessaire au service : un cookie de session (Supabase) qui te relie à ton audit
          après le paiement, et le stockage de ton navigateur décrit ci-dessus. Aucun cookie publicitaire ou de mesure
          d’audience.
        </p>
      </section>

      <section>
        <h2>4. Nos prestataires</h2>
        <ul>
          <li><strong>Supabase</strong> (base de données et session) : données hébergées dans l’Union européenne (Irlande).</li>
          <li><strong>Stripe</strong> (paiement) : Stripe traite tes données de paiement en tant que responsable de traitement pour ses propres obligations ; voir la politique de confidentialité de Stripe.</li>
          <li><strong>Vercel</strong> (hébergement du site et mesure d’audience).</li>
        </ul>
        <p className="mt-3">
          Certains de ces prestataires peuvent traiter des données aux États-Unis. Ces transferts sont encadrés par le cadre de
          protection des données UE–États-Unis (Data Privacy Framework) ou par les clauses contractuelles types de la Commission
          européenne.
        </p>
      </section>

      <section>
        <h2>5. Durée de conservation</h2>
        <ul>
          <li>Audit : tant que ton accès est actif, puis supprimé au plus tard 12 mois après la fin de ton accès.</li>
          <li>Audits commencés mais jamais payés : supprimés au plus tard après 30 jours.</li>
          <li>Données de facturation : pendant la durée légale de conservation des pièces comptables en Allemagne.</li>
        </ul>
      </section>

      <section>
        <h2>6. Tes droits</h2>
        <p className="mt-2">
          Tu peux demander l’accès à tes données, leur rectification, leur suppression, la limitation du traitement, leur
          portabilité, et t’opposer à un traitement fondé sur l’intérêt légitime. Écris-nous à{" "}
          <a href={`mailto:${VENDEUR.email}`}>{VENDEUR.email}</a>.
        </p>
        <p>
          Tu peux aussi déposer une réclamation auprès d’une autorité de protection des données, par exemple celle de ton pays
          de résidence (en France, la CNIL) ou celle dont nous relevons : {VENDEUR.autoriteDonnees.nom},{" "}
          {VENDEUR.autoriteDonnees.adresse} (<a href={VENDEUR.autoriteDonnees.site}>{VENDEUR.autoriteDonnees.site.replace("https://", "")}</a>).
        </p>
      </section>
    </PageLegale>
  );
}
