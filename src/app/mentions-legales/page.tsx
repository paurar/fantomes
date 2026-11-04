import type { Metadata } from "next";
import { PageSimple } from "@/components/PageSimple";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <PageSimple titre="Mentions légales">
      <p>Cette page est en cours de rédaction et sera complète avant l’ouverture des paiements.</p>
    </PageSimple>
  );
}
