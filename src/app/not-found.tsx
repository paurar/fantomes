import { PageSimple, RetourAccueil } from "@/components/PageSimple";

export default function PageIntrouvable() {
  return (
    <PageSimple titre="Cette page s’est volatilisée.">
      <p>Même pour un fantôme, c’est un peu fort. Le lien est peut-être incomplet ou la page a changé d’adresse.</p>
      <RetourAccueil />
    </PageSimple>
  );
}
