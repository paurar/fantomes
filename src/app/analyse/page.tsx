import type { Metadata } from "next";
import { PageSimple, RetourAccueil } from "@/components/PageSimple";

export const metadata: Metadata = { title: "Analyse de ton relevé", robots: { index: false } };

export default function Analyse() {
  return (
    <PageSimple titre="L’analyse de ton relevé arrive très bientôt.">
      <p>
        Tu pourras y déposer ton relevé bancaire : Fantômes trouvera tes vrais prélèvements récurrents,
        directement sur ton appareil. Ton relevé ne quittera jamais ton téléphone.
      </p>
      <RetourAccueil />
    </PageSimple>
  );
}
