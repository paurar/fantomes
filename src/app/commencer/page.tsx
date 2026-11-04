import type { Metadata } from "next";
import { Questions } from "./Questions";

export const metadata: Metadata = {
  title: "3 questions pour chiffrer tes fantômes",
  description: "Une minute, sans carte bancaire : estime ce que te coûtent les abonnements que tu as oubliés.",
};

export default function Commencer() {
  return <Questions />;
}
