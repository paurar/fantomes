// Relevé d'exemple : permet d'essayer Fantômes sans avoir son relevé sous la main.
import type { Operation } from "./detection";

export function operationsExemple(): Operation[] {
  const mois = ["2026-08", "2026-09", "2026-10"];
  const ops: Operation[] = [];
  const courses = [42.3, 67.85, 23.1];
  mois.forEach((m, i) => {
    ops.push(
      { date: `${m}-01`, libelle: "VIR SEPA RECU SALAIRE", montant: 1850, sens: "credit" },
      { date: `${m}-03`, libelle: "PRLV SEPA LOYER", montant: 640, sens: "debit" },
      { date: `${m}-05`, libelle: "PRLV SEPA NETFLIX.COM", montant: 13.49, sens: "debit" },
      { date: `${m}-08`, libelle: "PRLV SEPA DISNEY PLUS", montant: 9.99, sens: "debit" },
      { date: `${m}-12`, libelle: "CB SPOTIFY P2A3B4", montant: 10.99, sens: "debit" },
      { date: `${m}-15`, libelle: "PRLV SEPA FITNESS PARK", montant: 29.95, sens: "debit" },
      { date: `${m}-18`, libelle: "PRLV SEPA SFAM ASSURANCE MOBILE", montant: 14.99, sens: "debit" },
      { date: `${m}-21`, libelle: "CB APPLE.COM/BILL", montant: 2.99, sens: "debit" },
      { date: `${m}-24`, libelle: "CB CANVA PRO", montant: 11.99, sens: "debit" },
      { date: `${m}-11`, libelle: "CB CARREFOUR MARKET", montant: courses[i], sens: "debit" },
    );
  });
  return ops;
}
