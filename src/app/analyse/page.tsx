import type { Metadata } from "next";
import { Analyse } from "./Analyse";

export const metadata: Metadata = {
  title: "Analyse de ton relevé",
  description: "Dépose ton relevé : Fantômes repère tes prélèvements réguliers, directement sur ton appareil.",
  robots: { index: false },
};

export default function PageAnalyse() {
  return <Analyse />;
}
