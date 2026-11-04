-- Nettoyage automatique, conforme à la politique de confidentialité :
--  - audits jamais payés : supprimés après 30 jours
--  - audits des personnes dont l'accès a pris fin depuis plus de 12 mois : supprimés
create extension if not exists pg_cron;

create or replace function public.nettoyer_donnees() returns void
language sql security definer set search_path = public as $$
  -- Comptes sans aucun achat : audits de plus de 30 jours
  delete from public.audits a
  where a.created_at < now() - interval '30 days'
    and not exists (select 1 from public.purchases p where p.user_id = a.user_id);

  -- Comptes dont tous les achats ont pris fin il y a plus de 12 mois
  delete from public.audits a
  where exists (select 1 from public.purchases p where p.user_id = a.user_id)
    and not exists (
      select 1 from public.purchases p
      where p.user_id = a.user_id
        and (p.status in ('active', 'past_due') or p.updated_at > now() - interval '12 months')
    );
$$;

revoke all on function public.nettoyer_donnees() from public, anon, authenticated;

select cron.schedule('fantomes-nettoyage', '17 3 * * *', 'select public.nettoyer_donnees()');
