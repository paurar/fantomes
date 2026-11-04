import Link from "next/link";
import { Fantome } from "@/components/Fantome";
import { PiedDePage } from "@/components/PiedDePage";

// Exemple affiché sur le ticket : clairement présenté comme un exemple, pas comme un témoignage.
const exemple = [
  { nom: "Essai gratuit oublié", mensuel: 9.99 },
  { nom: "Option « cloud » jamais utilisée", mensuel: 2.99 },
  { nom: "2ᵉ plateforme vidéo", mensuel: 13.49 },
];

const euros = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });

export default function Accueil() {
  const totalAnnuel = exemple.reduce((s, l) => s + l.mensuel * 12, 0);

  return (
    <>
      <main className="flex-1 px-4 pb-28 pt-6 md:pb-16">
        <div className="mx-auto max-w-xl md:max-w-3xl">
          <header className="flex items-center gap-2">
            <Fantome className="h-7 w-7 text-encre" />
            <span className="font-titre text-xl font-bold tracking-tight">Fantômes</span>
          </header>

          {/* La promesse — identique à celle des vidéos */}
          <section className="pt-10 md:pt-16">
            <h1 className="font-titre text-[2.6rem] font-extrabold leading-[1.02] tracking-tight md:text-6xl">
              Tu paies des abonnements que tu n’utilises plus.
              <span className="mt-2 block text-vermillon">On les trouve en 2&nbsp;minutes.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-encre-douce">
              Dépose ton relevé bancaire. Fantômes repère chaque prélèvement qui revient, te montre
              ce qu’il te coûte <strong className="text-encre">à l’année</strong>, et prépare la lettre pour l’arrêter.
            </p>
          </section>

          {/* La douleur, chiffrée honnêtement */}
          <section aria-labelledby="ticket-titre" className="mt-10">
            <div className="ticket mx-auto max-w-sm rotate-[-1deg] px-6 py-8 shadow-[0_8px_30px_-12px_rgba(24,24,31,0.25)]">
              <p id="ticket-titre" className="text-center text-xs font-bold uppercase tracking-[0.2em] text-encre-douce">
                Exemple · ce que coûtent 3 petits oublis
              </p>
              <ul className="chiffres mt-5 space-y-3 text-base">
                {exemple.map((l) => (
                  <li key={l.nom} className="flex items-baseline justify-between gap-3">
                    <span>{l.nom}</span>
                    <span className="whitespace-nowrap text-encre-douce">{euros(l.mensuel)}/mois</span>
                  </li>
                ))}
              </ul>
              <div className="pointilles my-5" />
              <div className="chiffres flex items-baseline justify-between">
                <span className="font-bold">Sur un an</span>
                <span className="font-titre text-3xl font-extrabold text-vermillon">{euros(Math.round(totalAnnuel))}</span>
              </div>
              <p className="mt-3 text-sm text-encre-douce">
                Des petits montants, invisibles sur un relevé. Mais ils tournent chaque mois, souvent pendant des années.
              </p>
            </div>
          </section>

          {/* Trois bénéfices */}
          <section aria-label="Ce que fait Fantômes" className="mt-14">
            <ol className="space-y-7">
              <Benefice numero="1" titre="Ton relevé ne quitte jamais ton téléphone">
                L’analyse se fait sur ton appareil. On ne garde que la liste des abonnements trouvés.
              </Benefice>
              <Benefice numero="2" titre="Classés par ce qu’ils te coûtent à l’année">
                9,99&nbsp;€ par mois, ça paraît rien. 120&nbsp;€ par an, beaucoup moins.
              </Benefice>
              <Benefice numero="3" titre="Une lettre de résiliation prête pour chacun">
                Tu choisis ce que tu gardes. Pour le reste, la lettre est rédigée, tu n’as plus qu’à l’envoyer.
              </Benefice>
            </ol>
          </section>

          {/* Appel à l'action — bureau (sur mobile, il est fixé en bas de l'écran) */}
          <div className="mt-12 hidden md:block">
            <BoutonCommencer />
          </div>
        </div>
      </main>

      {/* Appel à l'action fixé en bas, à portée de pouce */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-encre/10 bg-papier/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-sm md:hidden">
        <BoutonCommencer />
      </div>

      <PiedDePage />
    </>
  );
}

function Benefice({ numero, titre, children }: { numero: string; titre: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="font-titre flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-billet text-lg font-bold text-papier">
        {numero}
      </span>
      <div>
        <h2 className="font-titre text-xl font-bold leading-tight">{titre}</h2>
        <p className="mt-1 text-encre-douce">{children}</p>
      </div>
    </li>
  );
}

function BoutonCommencer() {
  return (
    <div className="mx-auto max-w-xl md:mx-0">
      <Link
        href="/commencer"
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-vermillon px-6 text-lg font-bold text-white shadow-[0_4px_0_0_var(--color-vermillon-fonce)] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-vermillon-fonce)] md:w-auto"
      >
        Commencer — c’est gratuit
      </Link>
      <p className="mt-2 text-center text-sm text-encre-douce md:text-left">3 questions · 1 minute · sans carte bancaire</p>
    </div>
  );
}
