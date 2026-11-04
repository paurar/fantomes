import type { Metadata } from "next";
import { PageSimple } from "@/components/PageSimple";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <PageSimple titre="Politique de confidentialité">
      <p>Cette page est en cours de rédaction et sera complète avant l’ouverture des paiements.</p>
    </PageSimple>
  );
}
