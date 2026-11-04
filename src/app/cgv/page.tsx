import type { Metadata } from "next";
import { PageSimple } from "@/components/PageSimple";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function Page() {
  return (
    <PageSimple titre="Conditions générales de vente">
      <p>Cette page est en cours de rédaction et sera complète avant l’ouverture des paiements.</p>
    </PageSimple>
  );
}
