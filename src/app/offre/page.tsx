import type { Metadata } from "next";
import { PageSimple, RetourAccueil } from "@/components/PageSimple";

export const metadata: Metadata = { title: "Débloquer mon audit", robots: { index: false } };

export default function Offre() {
  return (
    <PageSimple titre="Le déblocage arrive très bientôt.">
      <p>
        Le paiement n’est pas encore ouvert. Dans quelques jours, tu pourras débloquer ici tous tes fantômes,
        leurs lettres de résiliation, et le suivi de tes économies.
      </p>
      <RetourAccueil />
    </PageSimple>
  );
}
