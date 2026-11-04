// Lettre de résiliation générée pour chaque fantôme.

export type InfosLettre = { nom: string; adresse: string; ville: string; reference: string };

export function genererLettre(service: string, infos: InfosLettre, date = new Date()): string {
  const jour = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const nom = infos.nom.trim() || "[Ton prénom et ton nom]";
  const adresse = infos.adresse.trim() || "[Ton adresse]";
  const ville = infos.ville.trim() || "[Ta ville]";
  const reference = infos.reference.trim();

  return [
    nom,
    adresse,
    "",
    `${service}`,
    "Service clients — Résiliation",
    "",
    `${ville}, le ${jour}`,
    "",
    `Objet : résiliation de mon abonnement ${service}`,
    reference ? `Référence client / n° de contrat : ${reference}` : "Référence client / n° de contrat : [à compléter si tu l’as]",
    "",
    "Madame, Monsieur,",
    "",
    `Par la présente, je vous informe de ma décision de résilier mon abonnement ${service}, à compter de la prochaine échéance ou dans le délai prévu par mon contrat.`,
    "",
    "Je vous demande de cesser tout prélèvement à partir de cette date et de m’adresser une confirmation écrite de cette résiliation.",
    "",
    "Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.",
    "",
    nom,
  ].join("\n");
}
