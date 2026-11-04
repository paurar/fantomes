"use client";

import { useState } from "react";
import { genererLettre, type InfosLettre } from "@/lib/lettre";

const CLE = "fantomes.coordonnees";

export function Lettre({ service, libelleBouton = "Préparer ma lettre" }: { service: string; libelleBouton?: string }) {
  const [ouverte, setOuverte] = useState(false);
  // Coordonnées gardées sur l'appareil uniquement, pour ne pas les retaper à chaque lettre
  const [infos, setInfosBrut] = useState<InfosLettre>(() => {
    const vide = { nom: "", adresse: "", ville: "", reference: "" };
    try {
      const c = JSON.parse(localStorage.getItem(CLE) ?? "{}");
      return { ...vide, nom: c.nom ?? "", adresse: c.adresse ?? "", ville: c.ville ?? "" };
    } catch { return vide; }
  });
  const setInfos = (i: InfosLettre) => {
    setInfosBrut(i);
    try { localStorage.setItem(CLE, JSON.stringify({ nom: i.nom, adresse: i.adresse, ville: i.ville })); } catch {}
  };
  const [copie, setCopie] = useState(false);
  const texte = genererLettre(service, infos);

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  }

  if (!ouverte) {
    return (
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-billet px-6 text-lg font-bold text-papier"
      >
        {libelleBouton}
      </button>
    );
  }

  const champ = "mt-1 w-full rounded-xl border-2 border-encre/15 bg-white px-3 py-3 text-base focus:border-billet focus:outline-none";
  return (
    <div className="mt-5 border-t border-encre/10 pt-5">
      <p className="font-bold">Ta lettre pour {service}</p>
      <div className="mt-3 grid gap-3">
        <label className="text-sm font-bold">Prénom et nom
          <input className={champ} autoComplete="name" value={infos.nom} onChange={(e) => setInfos({ ...infos, nom: e.target.value })} />
        </label>
        <label className="text-sm font-bold">Adresse
          <input className={champ} autoComplete="street-address" value={infos.adresse} onChange={(e) => setInfos({ ...infos, adresse: e.target.value })} />
        </label>
        <label className="text-sm font-bold">Ville
          <input className={champ} autoComplete="address-level2" value={infos.ville} onChange={(e) => setInfos({ ...infos, ville: e.target.value })} />
        </label>
        <label className="text-sm font-bold">N° client ou de contrat <span className="font-normal text-encre-douce">(si tu l’as)</span>
          <input className={champ} value={infos.reference} onChange={(e) => setInfos({ ...infos, reference: e.target.value })} />
        </label>
      </div>
      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-papier px-4 py-4 font-texte text-[0.9rem] leading-relaxed">{texte}</pre>
      <button
        type="button"
        onClick={copier}
        className="mt-3 flex min-h-14 w-full items-center justify-center rounded-2xl bg-billet px-6 text-lg font-bold text-papier"
      >
        {copie ? "Lettre copiée ✓" : "Copier la lettre"}
      </button>
      <p className="mt-3 text-sm text-encre-douce">
        Astuce : beaucoup de services permettent de résilier en ligne depuis ton espace client. Sinon, envoie cette lettre par
        e-mail au service clients, ou en recommandé avec accusé de réception.
      </p>
    </div>
  );
}
