-- Fantômes — schéma initial
-- Chaque visiteur reçoit un compte anonyme Supabase au moment du paywall.
-- Ses résultats et ses achats sont rattachés à ce compte.

-- 1. Audits : une analyse de relevé (+ réponses aux 3 questions)
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Fantômes détectés
create type public.ghost_status as enum ('detected', 'keep', 'to_cancel', 'cancelled');
create type public.ghost_frequency as enum ('hebdomadaire', 'mensuel', 'trimestriel', 'annuel');

create table public.ghosts (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) <= 120),
  bank_label text not null default '' check (char_length(bank_label) <= 200),
  amount_cents integer not null check (amount_cents > 0 and amount_cents <= 100000),
  frequency public.ghost_frequency not null,
  annual_cost_cents integer not null check (annual_cost_cents >= 0),
  last_charge_date date,
  status public.ghost_status not null default 'detected',
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
create index ghosts_user_idx on public.ghosts (user_id);

-- 3. Achats (écrits UNIQUEMENT par le webhook Stripe, côté serveur)
create type public.plan as enum ('audit', 'annuel', 'mensuel');
create type public.purchase_status as enum ('active', 'canceled', 'refunded', 'past_due');

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan public.plan not null,
  status public.purchase_status not null default 'active',
  email text,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index purchases_user_idx on public.purchases (user_id);

-- 4. Événements Stripe déjà traités (un paiement n'est jamais compté deux fois)
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- Sécurité : chaque personne ne voit que ses propres données
alter table public.audits enable row level security;
alter table public.ghosts enable row level security;
alter table public.purchases enable row level security;
alter table public.stripe_events enable row level security;

create policy "audits: lire les siens" on public.audits for select to authenticated using (user_id = (select auth.uid()));
create policy "audits: créer les siens" on public.audits for insert to authenticated with check (user_id = (select auth.uid()));

create policy "ghosts: lire les siens" on public.ghosts for select to authenticated using (user_id = (select auth.uid()));
create policy "ghosts: créer les siens" on public.ghosts for insert to authenticated with check (user_id = (select auth.uid()));
create policy "ghosts: changer le statut des siens" on public.ghosts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "purchases: lire les siens" on public.purchases for select to authenticated using (user_id = (select auth.uid()));
-- Pas de politique d'écriture sur purchases ni stripe_events : seul le serveur (clé secrète) peut y écrire.
