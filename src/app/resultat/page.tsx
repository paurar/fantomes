import type { Metadata } from "next";
import { Resultat } from "./Resultat";

export const metadata: Metadata = {
  title: "Ton estimation",
  robots: { index: false },
};

export default function PageResultat() {
  return <Resultat />;
}
