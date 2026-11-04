// Services à abonnement connus. Sert à :
//  1. donner un nom propre au fantôme (« NETFLIX.COM 866-579 » → « Netflix »)
//  2. repérer un abonnement même s'il n'apparaît qu'une fois sur un relevé d'un seul mois.
// Les motifs sont comparés à un libellé mis en majuscules et sans accents.

export type Marchand = { nom: string; motifs: string[]; frequence?: "mensuel" | "annuel" };

export const MARCHANDS: Marchand[] = [
  // Vidéo, musique, lecture
  { nom: "Netflix", motifs: ["NETFLIX"] },
  { nom: "Disney+", motifs: ["DISNEY PLUS", "DISNEYPLUS", "DISNEY+"] },
  { nom: "Amazon Prime", motifs: ["AMAZON PRIME", "PRIME VIDEO", "AMZN PRIME", "PRIMEVIDEO"] },
  { nom: "Canal+", motifs: ["CANAL+", "CANAL PLUS", "CANALPLUS", "MYCANAL"] },
  { nom: "Max", motifs: ["HBO MAX", "HBOMAX", "MAX.COM"] },
  { nom: "Paramount+", motifs: ["PARAMOUNT"] },
  { nom: "Apple TV+", motifs: ["APPLE TV"] },
  { nom: "DAZN", motifs: ["DAZN"] },
  { nom: "beIN Sports", motifs: ["BEIN SPORT", "BEINSPORT"] },
  { nom: "Crunchyroll", motifs: ["CRUNCHYROLL"] },
  { nom: "Molotov", motifs: ["MOLOTOV"] },
  { nom: "Spotify", motifs: ["SPOTIFY"] },
  { nom: "Deezer", motifs: ["DEEZER"] },
  { nom: "Apple Music", motifs: ["APPLE MUSIC"] },
  { nom: "YouTube Premium", motifs: ["YOUTUBE PREMIUM", "YOUTUBEPREMIUM", "GOOGLE YOUTUBE", "YOUTUBE MUSIC"] },
  { nom: "Audible", motifs: ["AUDIBLE"] },
  { nom: "Kindle Unlimited", motifs: ["KINDLE"] },
  { nom: "Twitch", motifs: ["TWITCH"] },
  // Logiciels, cloud
  { nom: "iCloud / Apple", motifs: ["APPLE.COM/BILL", "APPLE COM BILL", "ITUNES", "ICLOUD"] },
  { nom: "Google One / Google Play", motifs: ["GOOGLE ONE", "GOOGLE PLAY", "GOOGLE *", "GOOGLE STORAGE"] },
  { nom: "Microsoft 365", motifs: ["MICROSOFT", "MSFT", "XBOX"] },
  { nom: "Adobe", motifs: ["ADOBE"] },
  { nom: "Canva", motifs: ["CANVA"] },
  { nom: "Dropbox", motifs: ["DROPBOX"] },
  { nom: "ChatGPT", motifs: ["OPENAI", "CHATGPT"] },
  { nom: "Claude", motifs: ["ANTHROPIC", "CLAUDE.AI"] },
  { nom: "NordVPN", motifs: ["NORDVPN", "NORD VPN"] },
  { nom: "Duolingo", motifs: ["DUOLINGO"] },
  { nom: "LinkedIn Premium", motifs: ["LINKEDIN"] },
  // Jeux
  { nom: "PlayStation Plus", motifs: ["PLAYSTATION", "SONY INTERACTIVE", "PSN"] },
  { nom: "Nintendo Switch Online", motifs: ["NINTENDO"] },
  // Sport, bien-être, rencontres
  { nom: "Basic-Fit", motifs: ["BASIC FIT", "BASIC-FIT", "BASICFIT"] },
  { nom: "Fitness Park", motifs: ["FITNESS PARK"] },
  { nom: "Keepcool", motifs: ["KEEPCOOL"] },
  { nom: "On Air", motifs: ["ON AIR FITNESS"] },
  { nom: "McFIT", motifs: ["MCFIT", "RSG GROUP"] },
  { nom: "Strava", motifs: ["STRAVA"] },
  { nom: "Headspace", motifs: ["HEADSPACE"] },
  { nom: "Calm", motifs: ["CALM.COM"] },
  { nom: "Tinder", motifs: ["TINDER"] },
  { nom: "Meetic", motifs: ["MEETIC"] },
  { nom: "Bumble", motifs: ["BUMBLE"] },
  // Livraison, transport
  { nom: "Uber One", motifs: ["UBER ONE", "UBER *ONE"] },
  { nom: "Deliveroo Plus", motifs: ["DELIVEROO PLUS"] },
  // Presse
  { nom: "Le Monde", motifs: ["LE MONDE"] },
  { nom: "Le Figaro", motifs: ["LE FIGARO"] },
  { nom: "Mediapart", motifs: ["MEDIAPART"] },
  { nom: "L'Équipe", motifs: ["L EQUIPE", "LEQUIPE"] },
  { nom: "Cafeyn", motifs: ["CAFEYN"] },
  // Téléphonie, internet (souvent une 2e ligne ou une box oubliée)
  { nom: "Free", motifs: ["FREE MOBILE", "FREE TELECOM", "FREE HAUTDEBIT"] },
  { nom: "SFR", motifs: ["SFR"] },
  { nom: "Orange", motifs: ["ORANGE SA", "ORANGE FRANCE", "PRLV ORANGE"] },
  { nom: "Bouygues Telecom", motifs: ["BOUYGUES TEL", "BOUYGUES TELECOM"] },
  { nom: "Sosh", motifs: ["SOSH"] },
  { nom: "RED by SFR", motifs: ["RED BY SFR"] },
  // Assurances d'appareil et options bancaires
  { nom: "Assurance téléphone", motifs: ["ASSURANCE MOBILE", "ASSURANCE TELEPHONE", "SFAM", "INDEXIA", "HAPPYCASH", "CLEVERCOVER"] },
  { nom: "Amazon Music", motifs: ["AMAZON MUSIC", "AMZN MUSIC"] },
];

/** Opérations qui reviennent mais ne sont pas des abonnements à débusquer. */
export const EXCLUSIONS = [
  "SALAIRE", "PAIE ", "VIR RECU", "VIREMENT RECU", "VIR SEPA RECU", "VIR INST RE", "REMISE", "REMBOURS", "CAF ", "POLE EMPLOI",
  "FRANCE TRAVAIL", "LOYER", "RETRAIT", "DAB", "ESPECES", "IMPOT", "DGFIP", "URSSAF", "VIR PERMANENT", "VIREMENT PERMANENT",
  "EPARGNE", "LIVRET", "INTERETS", "COTISATION CARTE", "FRAIS", "COMMISSION",
  // Équivalents allemands (relevés de banques en Allemagne)
  "GEHALT", "LOHN", "GUTSCHRIFT", "MIETE", "BARGELD", "GELDAUTOMAT", "DAUERAUFTRAG", "UMBUCHUNG", "ENTGELT",
];

export function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function trouverMarchand(libelle: string): Marchand | undefined {
  const n = normaliser(libelle);
  return MARCHANDS.find((m) => m.motifs.some((motif) => n.includes(motif)));
}

export function estExclu(libelle: string): boolean {
  const n = normaliser(libelle);
  return EXCLUSIONS.some((e) => n.includes(e));
}
