// Réglages produit : formules, garantie, contact.

export const FORMULES = {
  audit: {
    nom: "Audit complet",
    prixCents: 1900,
    mode: "payment" as const,
    periode: "une fois",
    detail: "Tous les fantômes de ton relevé, leurs lettres prêtes, ton total d’économies.",
    parJour: "paiement unique",
    parMois: "rien d’autre à payer",
  },
  annuel: {
    nom: "Veille annuelle",
    prixCents: 3900,
    mode: "subscription" as const,
    intervalle: "year" as const,
    periode: "par an",
    detail: "L’audit complet, plus une nouvelle analyse quand tu veux pendant un an, pour attraper les nouveaux fantômes.",
    parJour: "≈ 0,11 € par jour",
    parMois: "soit 3,25 € par mois",
  },
  mensuel: {
    nom: "Veille mensuelle",
    prixCents: 900,
    mode: "subscription" as const,
    intervalle: "month" as const,
    periode: "par mois",
    detail: "L’audit complet, plus une nouvelle analyse quand tu veux, tant que tu restes abonné·e.",
    parJour: "≈ 0,30 € par jour",
    parMois: "9 € par mois",
  },
};

export type Plan = keyof typeof FORMULES;
export const PLANS: Plan[] = ["audit", "annuel", "mensuel"];

export const GARANTIE_JOURS = 30;

/** Adresse de contact affichée pour la garantie et les questions. À remplacer par l'adresse définitive. */
export const EMAIL_CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "[adresse-email-à-définir]";
