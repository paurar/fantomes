import type { Metadata } from "next";
import { PageSimple, RetourAccueil } from "@/components/PageSimple";

export const metadata: Metadata = { title: "Commencer" };

export default function Commencer() {
  return (
    <PageSimple titre="Le test arrive très bientôt.">
      <p>
        Les 3 questions qui chiffrent tes abonnements fantômes sont en cours de finition.
        Reviens dans quelques jours : ce sera gratuit, et ça prendra une minute.
      </p>
      <RetourAccueil />
    </PageSimple>
  );
}
