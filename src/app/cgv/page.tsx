import type { Metadata } from "next";
import { BlocVendeur, PageLegale } from "@/components/PageLegale";
import { FORMULES, GARANTIE_JOURS, VENDEUR } from "@/lib/config";

export const metadata: Metadata = { title: "Conditions générales de vente" };

const prix = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function CGV() {
  return (
    <PageLegale titre="Conditions générales de vente">
      <section>
        <h2>1. Vendeur</h2>
        <p className="mt-2">Le service Fantômes est proposé par :</p>
        <div className="mt-3"><BlocVendeur /></div>
        <p>Ces conditions s’appliquent à tout achat effectué sur ce site.</p>
      </section>

      <section>
        <h2>2. Le service</h2>
        <p className="mt-2">
          Fantômes analyse un relevé bancaire déposé par l’utilisateur, repère les prélèvements réguliers, les classe selon leur
          coût annuel et génère un modèle de lettre de résiliation pour chacun. L’analyse du relevé est réalisée directement
          sur l’appareil de l’utilisateur : le relevé n’est pas transmis à nos serveurs.
        </p>
        <p>
          La détection est automatique : elle peut omettre un prélèvement ou en signaler un qui n’est pas un abonnement.
          L’utilisateur reste seul juge de ce qu’il souhaite conserver ou résilier. Les lettres sont des modèles à compléter :
          Fantômes n’envoie aucune lettre à la place de l’utilisateur et ne garantit pas la réponse du prestataire concerné.
        </p>
      </section>

      <section>
        <h2>3. Formules et prix</h2>
        <ul>
          <li><strong>{FORMULES.audit.nom}</strong> : {prix(FORMULES.audit.prixCents)}, paiement unique, sans renouvellement.</li>
          <li><strong>{FORMULES.annuel.nom}</strong> : {prix(FORMULES.annuel.prixCents)} par an, renouvelé automatiquement chaque année.</li>
          <li><strong>{FORMULES.mensuel.nom}</strong> : {prix(FORMULES.mensuel.prixCents)} par mois, renouvelé automatiquement chaque mois.</li>
        </ul>
        <p className="mt-3">Les prix sont des prix finaux. {VENDEUR.tva}</p>
      </section>

      <section>
        <h2>4. Commande et paiement</h2>
        <p className="mt-2">
          Le contrat est conclu lorsque le paiement est confirmé. Le paiement est traité par Stripe ; Fantômes n’a jamais accès
          aux données de ta carte. L’accès au service s’ouvre immédiatement après la confirmation du paiement.
        </p>
      </section>

      <section>
        <h2>5. Durée et résiliation des veilles</h2>
        <p className="mt-2">
          Les veilles annuelle et mensuelle sont sans engagement. Tu peux les résilier à tout moment, en un clic, depuis ton
          audit (lien « Résilier mon abonnement »), ou en nous écrivant à <a href={`mailto:${VENDEUR.email}`}>{VENDEUR.email}</a>.
          La résiliation prend effet à la fin de la période déjà payée, jusqu’à laquelle tu gardes l’accès. Aucun autre
          prélèvement n’a lieu ensuite.
        </p>
      </section>

      <section>
        <h2>6. Garantie satisfait ou remboursé — {GARANTIE_JOURS} jours</h2>
        <p className="mt-2">
          Pendant {GARANTIE_JOURS} jours après ton paiement, tu peux demander le remboursement intégral de ton achat, sans avoir
          à te justifier. Il suffit d’écrire à <a href={`mailto:${VENDEUR.email}`}>{VENDEUR.email}</a> depuis l’adresse e-mail
          utilisée pour payer, ou en l’indiquant. Le remboursement est déclenché sous 2 jours ouvrés, sur le moyen de paiement
          utilisé ; il apparaît ensuite sur ton compte en 5 à 10 jours selon ta banque. Pour une veille, le remboursement
          met aussi fin à l’abonnement.
        </p>
        <p>Cette garantie s’ajoute à ton droit légal de rétractation, décrit ci-dessous, et ne le remplace pas.</p>
      </section>

      <section id="retractation">
        <h2>7. Droit de rétractation</h2>
        <p className="mt-2">
          Si tu es un consommateur, tu disposes d’un droit de rétractation de quatorze jours sans avoir à te justifier. Le délai
          court à partir du jour de la conclusion du contrat.
        </p>
        <p>
          Pour l’exercer, informe-nous de ta décision par une déclaration claire, par exemple par e-mail à{" "}
          <a href={`mailto:${VENDEUR.email}`}>{VENDEUR.email}</a> ou par courrier à l’adresse indiquée à l’article 1. Tu peux
          utiliser le modèle de formulaire ci-dessous, sans obligation. Il suffit que ta déclaration soit envoyée avant
          l’expiration du délai.
        </p>
        <p>
          <strong>Effets de la rétractation :</strong> nous te remboursons tous les paiements reçus sans retard excessif, et au
          plus tard dans les quatorze jours suivant la réception de ta décision, avec le même moyen de paiement que celui utilisé
          pour l’achat, sans aucuns frais.
        </p>
        <div className="mt-4 rounded-2xl border border-encre/15 bg-[#fffdf8] px-4 py-4 text-[0.95rem]">
          <p><strong>Modèle de formulaire de rétractation</strong></p>
          <p className="mt-2">(Remplis et renvoie ce formulaire uniquement si tu veux te rétracter du contrat.)</p>
          <p className="mt-2">
            À l’attention de {VENDEUR.nom}, {VENDEUR.adresse}, {VENDEUR.ville}, {VENDEUR.pays}, {VENDEUR.email} :
          </p>
          <p className="mt-2">
            Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de service ci-dessous :
            <br />— Formule commandée :
            <br />— Commandée le :
            <br />— Nom :
            <br />— Adresse e-mail utilisée pour le paiement :
            <br />— Date :
          </p>
        </div>
      </section>

      <section>
        <h2>8. Responsabilité</h2>
        <p className="mt-2">
          Fantômes est un outil d’aide à la décision. Nous sommes responsables sans limitation en cas de faute intentionnelle ou
          de négligence grave, ainsi qu’en cas d’atteinte à la vie, au corps ou à la santé. Pour le reste, notre responsabilité
          est limitée aux dommages prévisibles et typiques du contrat, dans la mesure permise par la loi.
        </p>
      </section>

      <section>
        <h2>9. Droit applicable</h2>
        <p className="mt-2">
          Le droit allemand s’applique. Si tu es un consommateur résidant dans un autre pays de l’Union européenne, tu conserves
          la protection des dispositions impératives du droit de ton pays de résidence.
        </p>
      </section>
    </PageLegale>
  );
}
