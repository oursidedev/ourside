-- Provider-agnostic billing ledger. No card data or provider secrets belong in these tables.
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique check(slug in ('free','plus','lifetime')),
  description text not null default '', price_monthly numeric(12,2), price_yearly numeric(12,2), currency text not null default 'USD',
  features jsonb not null default '[]'::jsonb, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete cascade, plan_id uuid not null references public.plans(id),
  provider text not null check(provider in ('mock','iyzico','paddle','lemon_squeezy','stripe','apple','google')),
  provider_customer_id text, provider_subscription_id text,
  status text not null check(status in ('trialing','active','past_due','canceled','expired')),
  current_period_start timestamptz, current_period_end timestamptz, cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete cascade, provider text not null check(provider in ('mock','iyzico','paddle','lemon_squeezy','stripe','apple','google')),
  provider_payment_id text, amount numeric(12,2) not null check(amount>=0), currency text not null,
  status text not null check(status in ('pending','paid','failed','refunded')), paid_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(), provider text not null check(provider in ('mock','iyzico','paddle','lemon_squeezy','stripe','apple','google')),
  event_type text not null, event_id text not null, payload jsonb not null, processed_at timestamptz, created_at timestamptz not null default now(),
  unique(provider,event_id)
);

alter table public.plans enable row level security; alter table public.subscriptions enable row level security;
alter table public.payments enable row level security; alter table public.billing_events enable row level security;
create policy "anyone reads active plans" on public.plans for select using(is_active=true);
create policy "users read applicable subscriptions" on public.subscriptions for select to authenticated using(user_id=auth.uid() or (couple_id is not null and public.is_couple_member(couple_id)));
create policy "users read applicable payments" on public.payments for select to authenticated using(user_id=auth.uid() or (couple_id is not null and public.is_couple_member(couple_id)));
-- billing_events intentionally has no client policy. Verified server webhooks use a server-only service role.

create index if not exists subscriptions_user_status_idx on public.subscriptions(user_id,status,updated_at desc);
create index if not exists subscriptions_couple_status_idx on public.subscriptions(couple_id,status,updated_at desc);
create unique index if not exists subscriptions_provider_subscription_idx on public.subscriptions(provider,provider_subscription_id) where provider_subscription_id is not null;
create index if not exists payments_user_created_idx on public.payments(user_id,created_at desc);
create unique index if not exists payments_provider_payment_idx on public.payments(provider,provider_payment_id) where provider_payment_id is not null;
create unique index if not exists billing_events_provider_event_idx on public.billing_events(provider,event_id);
create index if not exists billing_events_unprocessed_idx on public.billing_events(created_at) where processed_at is null;

insert into public.plans(name,slug,description,price_monthly,price_yearly,currency,features)
values
 ('Keepsake','free','For couples beginning their private story.',0,0,'USD','[]'::jsonb),
 ('Ourside Plus','plus','Room for every chapter, letter, and little thing.',5.99,59.99,'USD','["video_upload","unlimited_letters","unlimited_albums","premium_themes","relationship_yearbook","store_original_images","voice_notes","full_export"]'::jsonb),
 ('Ourside Forever','lifetime','A permanent archive designed for a lifetime together.',null,null,'USD','["video_upload","unlimited_letters","unlimited_albums","premium_themes","relationship_yearbook","store_original_images","voice_notes","full_export"]'::jsonb)
on conflict(slug) do update set name=excluded.name,description=excluded.description,price_monthly=excluded.price_monthly,price_yearly=excluded.price_yearly,currency=excluded.currency,features=excluded.features,is_active=true,updated_at=now();
