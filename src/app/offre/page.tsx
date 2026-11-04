import type { Metadata } from "next";
import { Paywall } from "./Paywall";

export const metadata: Metadata = { title: "Débloquer mon audit", robots: { index: false } };

export default function PageOffre() {
  return <Paywall />;
}
