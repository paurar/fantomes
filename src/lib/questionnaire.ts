// Les 3 questions du tunnel et le calcul de l'estimation.
// L'estimation est volontairement prudente et présentée comme telle : le vrai chiffre vient du relevé.

export type Choix = { valeur: string; libelle: string };
export type Question = { id: "combien" | "releve" | "essai"; titre: string; aide: string; choix: Choix[] };

export const QUESTIONS: Question[] = [
  {
    id: "combien",
    titre: "Combien d’abonnements penses-tu payer chaque mois ?",
    aide: "Streaming, musique, appli, salle de sport, cloud, assurance d’appareil… tout compte.",
    choix: [
      { valeur: "1-3", libelle: "1 à 3" },
      { valeur: "4-6", libelle: "4 à 6" },
      { valeur: "7-10", libelle: "7 à 10" },
      { valeur: "10+", libelle: "Plus de 10" },
      { valeur: "?", libelle: "Je ne sais pas vraiment" },
    ],
  },
  {
    id: "releve",
    titre: "Quand as-tu lu ton relevé bancaire ligne par ligne pour la dernière fois ?",
    aide: "Pas juste le solde : chaque prélèvement, un par un.",
    choix: [
      { valeur: "mois", libelle: "Ce mois-ci" },
      { valeur: "mois-s", libelle: "Il y a quelques mois" },
      { valeur: "an", libelle: "Il y a plus d’un an" },
      { valeur: "jamais", libelle: "Jamais, honnêtement" },
    ],
  },
  {
    id: "essai",
    titre: "As-tu déjà oublié d’arrêter un essai gratuit avant qu’il devienne payant ?",
    aide: "Le fameux « 1 mois offert, puis 9,99 € ».",
    choix: [
      { valeur: "non", libelle: "Non, jamais" },
      { valeur: "une", libelle: "Oui, une fois" },
      { valeur: "plusieurs", libelle: "Oui, plusieurs fois" },
      { valeur: "?", libelle: "Je ne suis pas sûr·e" },
    ],
  },
];

export type Reponses = Partial<Record<Question["id"], string>>;

/** Montant mensuel retenu par abonnement oublié pour l'estimation (hypothèse affichée à l'écran). */
export const MONTANT_MOYEN_OUBLI = 8;

const NB_ABONNEMENTS: Record<string, number> = { "1-3": 2, "4-6": 5, "7-10": 8, "10+": 12, "?": 6 };
const PART_OUBLIEE: Record<string, number> = { mois: 0.1, "mois-s": 0.2, an: 0.3, jamais: 0.35 };
const ESSAIS_OUBLIES: Record<string, number> = { non: 0, une: 1, plusieurs: 2, "?": 1 };

export function estimer(r: Reponses) {
  const nb = NB_ABONNEMENTS[r.combien ?? "?"] ?? 6;
  const part = PART_OUBLIEE[r.releve ?? "an"] ?? 0.3;
  const essais = ESSAIS_OUBLIES[r.essai ?? "?"] ?? 1;
  // Au moins 1, au plus le nombre d'abonnements déclarés (+ essais qui ont pu s'y ajouter)
  const fantomes = Math.max(1, Math.min(nb + essais, Math.round(nb * part) + essais));
  const parMois = fantomes * MONTANT_MOYEN_OUBLI;
  return { fantomes, parMois, parAn: parMois * 12, surTroisAns: parMois * 36 };
}

/** Reprend les réponses de la personne avec ses mots, pour l'écran de résultat. */
export function phrasesPersonnalisees(r: Reponses): string[] {
  const p: string[] = [];
  switch (r.combien) {
    case "1-3": p.push("Tu penses payer 1 à 3 abonnements."); break;
    case "4-6": p.push("Tu penses payer 4 à 6 abonnements."); break;
    case "7-10": p.push("Tu penses payer 7 à 10 abonnements."); break;
    case "10+": p.push("Tu penses payer plus de 10 abonnements."); break;
    default: p.push("Tu ne sais pas vraiment combien d’abonnements tu paies — c’est exactement là que les fantômes se cachent.");
  }
  switch (r.releve) {
    case "mois": p.push("Tu as lu ton relevé ce mois-ci : bien joué, mais un prélèvement annuel peut t’avoir échappé."); break;
    case "mois-s": p.push("Ta dernière lecture ligne par ligne remonte à quelques mois."); break;
    case "an": p.push("Ta dernière lecture ligne par ligne remonte à plus d’un an."); break;
    default: p.push("Tu n’as jamais lu ton relevé ligne par ligne."); break;
  }
  switch (r.essai) {
    case "non": p.push("Tu n’as jamais oublié d’essai gratuit — mais une option activée une fois, ça arrive à tout le monde."); break;
    case "une": p.push("Tu as déjà oublié un essai gratuit au moins une fois."); break;
    case "plusieurs": p.push("Tu as déjà oublié plusieurs essais gratuits."); break;
    default: p.push("Tu n’es pas sûr·e d’avoir arrêté tous tes essais gratuits."); break;
  }
  return p;
}

const CLE = "fantomes.reponses";

export function sauverReponses(r: Reponses) {
  try { sessionStorage.setItem(CLE, JSON.stringify(r)); } catch { /* navigation privée stricte : on continue sans */ }
}

export function lireReponses(): Reponses | null {
  try {
    const brut = sessionStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as Reponses) : null;
  } catch {
    return null;
  }
}

export const euros = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
