import type { Metadata } from "next";
import { Audit } from "./Audit";

export const metadata: Metadata = { title: "Mon audit", robots: { index: false } };

export default function PageAudit() {
  return <Audit />;
}
