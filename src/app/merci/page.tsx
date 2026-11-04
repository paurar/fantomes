import type { Metadata } from "next";
import { Suspense } from "react";
import { Merci } from "./Merci";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

export default function PageMerci() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <Merci />
    </Suspense>
  );
}
