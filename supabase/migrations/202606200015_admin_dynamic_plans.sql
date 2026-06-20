-- Internal administration and dynamic plan controls.
-- Existing public.plans is extended instead of creating a competing plan table.

alter table public.plans add column if not exists lifetime_price numeric(12,2);
alter table public.plans add column if not exists monthly_price_label text;
alter table public.plans add column if not exists yearly_price_label text;
alter table public.plans add column if not exists lifetime_price_label text;
alter table public.plans add column if not exists is_free boolean not null default false;
alter table public.plans add column if not exists is_public boolean not null default true;
alter table public.plans add column if not exists is_featured boolean not null default false;
alter table public.plans add column if not exists badge_text text;
alter table public.plans add column if not exists cta_text text;
alter table public.plans add column if not exists display_order integer not null default 0;
alter table public.plans add column if not exists trial_days integer not null default 0;
alter table public.plans add column if not exists limits jsonb not null default '{}'::jsonb;
alter table public.plans add column if not exists marketing_features jsonb not null default '[]'::jsonb;
alter table public.plans add column if not exists regional_prices jsonb not null default '{}'::jsonb;
alter table public.plans add column if not exists provider text;
alter table public.plans add column if not exists provider_product_id text;
alter table public.plans add column if not exists provider_monthly_price_id text;
alter table public.plans add column if not exists provider_yearly_price_id text;
alter table public.plans add column if not exists provider_lifetime_price_id text;
alter table public.plans drop constraint if exists plans_slug_check;
alter table public.plans add constraint plans_slug_format_check check(slug ~ '^[a-z0-9][a-z0-9-]{1,39}$');

-- Existing feature arrays are migrated to structured flags used by enforcement.
update public.plans set
  is_free=(slug='free'),
  lifetime_price=case when slug='lifetime' then 179 else lifetime_price end,
  is_featured=(slug='plus'),
  display_order=case slug when 'free' then 0 when 'plus' then 1 when 'lifetime' then 2 else display_order end,
  badge_text=case when slug='plus' then 'Most loved' else badge_text end,
  cta_text=coalesce(cta_text,case when slug='free' then 'Start free' when slug='plus' then 'Choose Plus' else 'Choose Lifetime' end),
  limits=case when slug='free' then '{"memories":50,"mediaItems":50,"videos":0,"storageMb":500,"letters":3,"futureLetters":3,"milestones":20,"bucketListItems":20,"albums":3,"coupleMembers":2,"maxUploadMb":10}'::jsonb else '{"memories":null,"mediaItems":null,"videos":null,"storageMb":null,"letters":null,"futureLetters":null,"milestones":null,"bucketListItems":null,"albums":null,"coupleMembers":2,"maxUploadMb":25}'::jsonb end,
  features=case when slug='free' then '{"videoUpload":false,"premiumThemes":false,"exportData":false,"prioritySupport":false,"advancedNotifications":false,"storeOriginalImages":false,"voiceNotes":false,"relationshipYearbook":false}'::jsonb else '{"videoUpload":true,"premiumThemes":true,"exportData":true,"prioritySupport":true,"advancedNotifications":true,"storeOriginalImages":true,"voiceNotes":true,"relationshipYearbook":true}'::jsonb end,
  marketing_features=case when slug='free' then '["Up to 50 memories","3 future letters","500 MB private storage","Private couple space"]'::jsonb else '["Unlimited memories and albums","Original-quality photo storage","Future letters with voice notes","Full memory export"]'::jsonb end,
  regional_prices=case when slug='free' then '{"US":{"currency":"USD","monthly":0,"yearly":0,"lifetime":0},"TR":{"currency":"TRY","monthly":0,"yearly":0,"lifetime":0},"EU":{"currency":"EUR","monthly":0,"yearly":0,"lifetime":0},"GB":{"currency":"GBP","monthly":0,"yearly":0,"lifetime":0},"CA":{"currency":"CAD","monthly":0,"yearly":0,"lifetime":0},"AU":{"currency":"AUD","monthly":0,"yearly":0,"lifetime":0}}'::jsonb when slug='plus' then '{"US":{"currency":"USD","monthly":5.99,"yearly":59.99,"lifetime":179},"TR":{"currency":"TRY","monthly":199,"yearly":1990,"lifetime":5990},"EU":{"currency":"EUR","monthly":5.49,"yearly":54.99,"lifetime":169},"GB":{"currency":"GBP","monthly":4.99,"yearly":49.99,"lifetime":149},"CA":{"currency":"CAD","monthly":7.99,"yearly":79.99,"lifetime":239},"AU":{"currency":"AUD","monthly":8.99,"yearly":89.99,"lifetime":269}}'::jsonb else '{"US":{"currency":"USD","monthly":null,"yearly":null,"lifetime":179},"TR":{"currency":"TRY","monthly":null,"yearly":null,"lifetime":5990},"EU":{"currency":"EUR","monthly":null,"yearly":null,"lifetime":169},"GB":{"currency":"GBP","monthly":null,"yearly":null,"lifetime":149},"CA":{"currency":"CAD","monthly":null,"yearly":null,"lifetime":239},"AU":{"currency":"AUD","monthly":null,"yearly":null,"lifetime":269}}'::jsonb end;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
  email text not null unique, role text not null default 'owner' check(role in ('owner','admin','support','readonly')),
  is_active boolean not null default true, created_at timestamptz not null default now()
);
insert into public.admin_users(user_id,email,role)
select id,'ourside.dev@gmail.com','owner' from auth.users where lower(email)=lower('ourside.dev@gmail.com')
on conflict(email) do update set user_id=coalesce(public.admin_users.user_id,excluded.user_id),is_active=true;
insert into public.admin_users(email,role) values('ourside.dev@gmail.com','owner') on conflict(email) do nothing;

create or replace function public.is_admin(check_user uuid default auth.uid()) returns boolean
language sql stable security definer set search_path=public,auth as $$
  select exists(select 1 from public.admin_users a where a.is_active and (a.user_id=check_user or lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))));
$$;
revoke all on function public.is_admin(uuid) from public; grant execute on function public.is_admin(uuid) to authenticated;

create table if not exists public.admin_audit_logs (
 id uuid primary key default gen_random_uuid(), admin_user_id uuid, admin_email text, action text not null,
 target_type text, target_id text, metadata jsonb not null default '{}'::jsonb, ip_address text, user_agent text,
 created_at timestamptz not null default now()
);
create table if not exists public.subscription_plan_changes (
 id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.plans(id) on delete cascade,
 admin_email text, change_type text not null, before_data jsonb, after_data jsonb, reason text, created_at timestamptz not null default now()
);
create table if not exists public.user_plan_overrides (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan_slug text not null, limits_override jsonb, features_override jsonb, reason text, created_by_admin_email text,
 expires_at timestamptz, created_at timestamptz not null default now()
);
create unique index if not exists active_user_plan_override_idx on public.user_plan_overrides(user_id) where expires_at is null;

create or replace function public.effective_couple_plan(target_couple uuid)
returns text language sql stable security definer set search_path=public as $$
  select coalesce(
    (select o.plan_slug from public.user_plan_overrides o join public.couple_members cm on cm.user_id=o.user_id where cm.couple_id=target_couple and (o.expires_at is null or o.expires_at>now()) order by o.created_at desc limit 1),
    (select p.slug from public.subscriptions s join public.plans p on p.id=s.plan_id where (s.couple_id=target_couple or (s.couple_id is null and exists(select 1 from public.couple_members cm where cm.couple_id=target_couple and cm.user_id=s.user_id))) and s.status in ('active','trialing') and (p.slug='lifetime' or s.current_period_end is null or s.current_period_end>now()) order by s.updated_at desc limit 1),
    'free');
$$;

create table if not exists public.analytics_visitors (
 id text primary key, first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
 first_domain text, last_domain text, device_type text, browser text
);
create table if not exists public.analytics_sessions (
 id text primary key, visitor_id text not null references public.analytics_visitors(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null, domain text, referrer_host text,
 started_at timestamptz not null default now(), last_heartbeat_at timestamptz not null default now()
);
create table if not exists public.analytics_page_views (
 id bigint generated always as identity primary key, session_id text not null references public.analytics_sessions(id) on delete cascade,
 visitor_id text not null, domain text not null, path text not null, created_at timestamptz not null default now()
);
create table if not exists public.analytics_events (
 id bigint generated always as identity primary key, session_id text, visitor_id text, name text not null,
 path text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.app_errors (
 id uuid primary key default gen_random_uuid(), fingerprint text not null, level text not null default 'error', message text not null,
 stack text, source text, path text, domain text, user_id uuid references auth.users(id) on delete set null,
 session_id text, visitor_id text, user_agent text, status text not null default 'open' check(status in ('open','investigating','resolved','ignored')),
 occurrence_count integer not null default 1, first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create unique index if not exists app_errors_fingerprint_idx on public.app_errors(fingerprint);
create table if not exists public.notification_logs (
 id uuid primary key default gen_random_uuid(), notification_id uuid, user_id uuid references auth.users(id) on delete set null,
 channel text not null, provider text, status text not null, error_summary text, sent_at timestamptz, created_at timestamptz not null default now()
);

create index if not exists admin_audit_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists plan_changes_plan_created_idx on public.subscription_plan_changes(plan_id,created_at desc);
create index if not exists analytics_sessions_live_idx on public.analytics_sessions(last_heartbeat_at desc);
create index if not exists analytics_page_views_created_idx on public.analytics_page_views(created_at desc);
create index if not exists analytics_page_views_path_idx on public.analytics_page_views(path,created_at desc);
create index if not exists app_errors_status_seen_idx on public.app_errors(status,last_seen_at desc);

alter table public.admin_users enable row level security; alter table public.admin_audit_logs enable row level security;
alter table public.subscription_plan_changes enable row level security; alter table public.user_plan_overrides enable row level security;
alter table public.analytics_visitors enable row level security; alter table public.analytics_sessions enable row level security;
alter table public.analytics_page_views enable row level security; alter table public.analytics_events enable row level security;
alter table public.app_errors enable row level security; alter table public.notification_logs enable row level security;

create policy "admins read admin users" on public.admin_users for select to authenticated using(public.is_admin());
create policy "owners manage admin users" on public.admin_users for all to authenticated using(public.is_admin() and exists(select 1 from public.admin_users me where me.is_active and me.role='owner' and (me.user_id=auth.uid() or lower(me.email)=lower(auth.jwt()->>'email')))) with check(public.is_admin());
create policy "admins read plans" on public.plans for select to authenticated using(public.is_admin() or (is_active and is_public));
drop policy if exists "anyone reads active plans" on public.plans;
create policy "public reads published plans" on public.plans for select to anon,authenticated using(is_active and is_public);
create policy "admins manage plans" on public.plans for all to authenticated using(public.is_admin()) with check(public.is_admin());

do $$ declare table_name text; begin
 foreach table_name in array array['admin_audit_logs','subscription_plan_changes','user_plan_overrides','analytics_visitors','analytics_sessions','analytics_page_views','analytics_events','app_errors','notification_logs'] loop
   execute format('create policy "admins read %s" on public.%I for select to authenticated using(public.is_admin())',table_name,table_name);
 end loop;
end $$;
create policy "admins write audit" on public.admin_audit_logs for insert to authenticated with check(public.is_admin());
create policy "admins write plan changes" on public.subscription_plan_changes for insert to authenticated with check(public.is_admin());
create policy "admins manage overrides" on public.user_plan_overrides for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "anonymous analytics visitors" on public.analytics_visitors for insert to anon,authenticated with check(length(id) between 16 and 100);
create policy "anonymous analytics visitor updates" on public.analytics_visitors for update to anon,authenticated using(length(id) between 16 and 100) with check(length(id) between 16 and 100);
create policy "anonymous analytics sessions" on public.analytics_sessions for insert to anon,authenticated with check(length(id) between 16 and 100 and length(visitor_id) between 16 and 100);
create policy "anonymous analytics heartbeats" on public.analytics_sessions for update to anon,authenticated using(length(id) between 16 and 100) with check(length(id) between 16 and 100);
create policy "anonymous page views" on public.analytics_page_views for insert to anon,authenticated with check(path not like '%token=%' and length(path)<=300);
create policy "anonymous analytics events" on public.analytics_events for insert to anon,authenticated with check(length(name)<=80 and coalesce(length(path),0)<=300);
create policy "clients report sanitized errors" on public.app_errors for insert to anon,authenticated with check(length(message)<=1000 and stack is null);
create policy "admins update errors" on public.app_errors for update to authenticated using(public.is_admin()) with check(public.is_admin());

-- A single function resolves dynamic plan limits for database triggers.
create or replace function public.effective_couple_plan_record(target_couple uuid) returns public.plans
language sql stable security definer set search_path=public as $$
 select p from public.plans p where p.slug=public.effective_couple_plan(target_couple) and p.is_active limit 1;
$$;

create or replace function public.enforce_memory_plan_limit() returns trigger
language plpgsql security definer set search_path=public as $$
declare p public.plans; quota integer; used integer;
begin p:=public.effective_couple_plan_record(new.couple_id); quota:=(p.limits->>'memories')::integer;
 if quota is not null then select count(*) into used from public.memories where couple_id=new.couple_id; if used>=quota then raise exception 'PLAN_LIMIT:memories:%:%',used,quota; end if; end if; return new; end $$;
drop trigger if exists enforce_memory_plan on public.memories;
create trigger enforce_memory_plan before insert on public.memories for each row execute function public.enforce_memory_plan_limit();

create or replace function public.enforce_media_plan_limits() returns trigger
language plpgsql security definer set search_path=public as $$
declare p public.plans; target_couple uuid; quota integer; used integer; upload_mb integer;
begin select couple_id into target_couple from public.memories where id=new.memory_id; p:=public.effective_couple_plan_record(target_couple);
 quota:=(p.limits->>'mediaItems')::integer; upload_mb:=coalesce((p.limits->>'maxUploadMb')::integer,25);
 if quota is not null then select count(*) into used from public.memory_media where couple_id=target_couple; if used>=quota then raise exception 'PLAN_LIMIT:mediaItems:%:%',used,quota; end if; end if;
 if coalesce(new.file_size,0)>upload_mb*1024*1024 then raise exception 'PLAN_LIMIT:maxUploadMb:%:%',ceil(new.file_size/1024.0/1024.0),upload_mb; end if;
 if new.type='video' and not coalesce((p.features->>'videoUpload')::boolean,false) then raise exception 'PLAN_FEATURE:videoUpload'; end if;
 if new.storage_path_original is not null and not coalesce((p.features->>'storeOriginalImages')::boolean,false) then raise exception 'PLAN_FEATURE:storeOriginalImages'; end if; return new; end $$;

create or replace function public.enforce_letter_plan_limit() returns trigger
language plpgsql security definer set search_path=public as $$
declare p public.plans; quota integer; used integer;
begin p:=public.effective_couple_plan_record(new.couple_id); quota:=(p.limits->>'futureLetters')::integer;
 if quota is not null then select count(*) into used from public.letters where couple_id=new.couple_id and status<>'archived'; if used>=quota then raise exception 'PLAN_LIMIT:futureLetters:%:%',used,quota; end if; end if; return new; end $$;

-- Lowering a limit never deletes intimate user content; triggers only block new rows above quota.
create or replace function public.enforce_generic_couple_limit() returns trigger
language plpgsql security definer set search_path=public as $$
declare p public.plans; quota integer; used integer; limit_key text; table_name text;
begin table_name:=tg_table_name; limit_key:=case table_name when 'milestones' then 'milestones' when 'bucket_list_items' then 'bucketListItems' when 'albums' then 'albums' end;
 p:=public.effective_couple_plan_record(new.couple_id); quota:=(p.limits->>limit_key)::integer;
 if quota is not null then execute format('select count(*) from public.%I where couple_id=$1',table_name) into used using new.couple_id; if used>=quota then raise exception 'PLAN_LIMIT:%:%:%',limit_key,used,quota; end if; end if; return new; end $$;
drop trigger if exists enforce_album_plan on public.albums; create trigger enforce_album_plan before insert on public.albums for each row execute function public.enforce_generic_couple_limit();
drop trigger if exists enforce_milestone_plan on public.milestones; create trigger enforce_milestone_plan before insert on public.milestones for each row execute function public.enforce_generic_couple_limit();
drop trigger if exists enforce_bucket_plan on public.bucket_list_items; create trigger enforce_bucket_plan before insert on public.bucket_list_items for each row execute function public.enforce_generic_couple_limit();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now(); return new; end$$;
drop trigger if exists plans_touch_updated_at on public.plans; create trigger plans_touch_updated_at before update on public.plans for each row execute function public.touch_updated_at();

-- Privacy-safe admin RPCs expose counts and account metadata, never memory notes,
-- letter bodies, raw media URLs, invite tokens or authentication secrets.
create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path=public,auth as $$
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 return jsonb_build_object(
  'totalUsers',(select count(*) from auth.users), 'totalCouples',(select count(*) from public.couples),
  'totalMemories',(select count(*) from public.memories), 'totalMedia',(select count(*) from public.memory_media),
  'totalInvites',(select count(*) from public.partner_invites), 'pendingInvites',(select count(*) from public.partner_invites where status='pending' and expires_at>now()),
  'premiumUsers',(select count(distinct user_id) from public.subscriptions where status in ('active','trialing')),
  'openErrors',(select count(*) from public.app_errors where status in ('open','investigating')),
  'todaySignups',(select count(*) from auth.users where created_at>=current_date),
  'weekSignups',(select count(*) from auth.users where created_at>=now()-interval '7 days'),
  'liveVisitors',(select count(*) from public.analytics_sessions where last_heartbeat_at>=now()-interval '60 seconds'),
  'totalVisitors',(select count(*) from public.analytics_visitors), 'pageViews',(select count(*) from public.analytics_page_views),
  'activePlans',(select count(*) from public.plans where is_active), 'publicPlans',(select count(*) from public.plans where is_active and is_public),
  'freeMemoryLimit',(select limits->'memories' from public.plans where slug='free'),
  'plusMonthlyPrice',(select price_monthly from public.plans where slug='plus')
 );
end $$;

create or replace function public.admin_list_users(search_text text default '', row_limit integer default 100)
returns table(id uuid,email text,display_name text,avatar_url text,created_at timestamptz,email_verified boolean,couple_id uuid,plan_slug text,memory_count bigint,media_count bigint)
language plpgsql stable security definer set search_path=public,auth as $$
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 return query select u.id,u.email,p.display_name,p.avatar_url,u.created_at,u.email_confirmed_at is not null,cm.couple_id,
 coalesce((select pl.slug from public.subscriptions s join public.plans pl on pl.id=s.plan_id where s.user_id=u.id and s.status in ('active','trialing') order by s.updated_at desc limit 1),'free'),
 (select count(*) from public.memories m where m.couple_id=cm.couple_id),(select count(*) from public.memory_media mm where mm.couple_id=cm.couple_id)
 from auth.users u left join public.profiles p on p.id=u.id left join public.couple_members cm on cm.user_id=u.id
 where search_text='' or u.email ilike '%'||search_text||'%' or p.display_name ilike '%'||search_text||'%' order by u.created_at desc limit least(row_limit,250);
end $$;

create or replace function public.admin_list_couples(row_limit integer default 100)
returns table(id uuid,name text,created_at timestamptz,member_count bigint,memory_count bigint,media_count bigint,letter_count bigint,milestone_count bigint,last_activity timestamptz)
language plpgsql stable security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 return query select c.id,c.name,c.created_at,(select count(*) from public.couple_members cm where cm.couple_id=c.id),(select count(*) from public.memories m where m.couple_id=c.id),(select count(*) from public.memory_media mm where mm.couple_id=c.id),(select count(*) from public.letters l where l.couple_id=c.id),(select count(*) from public.milestones ms where ms.couple_id=c.id),greatest(c.updated_at,(select max(m.updated_at) from public.memories m where m.couple_id=c.id)) from public.couples c order by c.created_at desc limit least(row_limit,250);
end $$;

create or replace function public.admin_list_invites(row_limit integer default 100)
returns table(id uuid,couple_id uuid,inviter_email text,status text,created_at timestamptz,accepted_at timestamptz,expires_at timestamptz,masked_code text)
language plpgsql stable security definer set search_path=public,auth as $$
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 return query select i.id,i.couple_id,u.email,i.status,i.created_at,i.accepted_at,i.expires_at,case when i.invite_code is null then null else left(i.invite_code,4)||'…'||right(i.invite_code,2) end from public.partner_invites i left join auth.users u on u.id=i.created_by order by i.created_at desc limit least(row_limit,250);
end $$;

revoke all on function public.admin_overview() from public;
revoke all on function public.admin_list_users(text,integer) from public;
revoke all on function public.admin_list_couples(integer) from public;
revoke all on function public.admin_list_invites(integer) from public;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_list_users(text,integer) to authenticated;
grant execute on function public.admin_list_couples(integer) to authenticated;
grant execute on function public.admin_list_invites(integer) to authenticated;

create or replace function public.admin_save_plan(target_id uuid, payload jsonb, change_reason text default null) returns jsonb
language plpgsql security definer set search_path=public as $$
declare before_row public.plans; saved public.plans; actor_email text:=auth.jwt()->>'email';
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 if target_id is null then
  insert into public.plans(name,slug,description,currency,price_monthly,price_yearly,lifetime_price,is_free,is_active,is_public,is_featured,badge_text,cta_text,display_order,trial_days,limits,features,marketing_features,regional_prices)
  values(payload->>'name',payload->>'slug',coalesce(payload->>'description',''),coalesce(payload->>'currency','USD'),nullif(payload->>'monthlyPrice','')::numeric,nullif(payload->>'yearlyPrice','')::numeric,nullif(payload->>'lifetimePrice','')::numeric,coalesce((payload->>'isFree')::boolean,false),coalesce((payload->>'isActive')::boolean,true),coalesce((payload->>'isPublic')::boolean,true),coalesce((payload->>'isFeatured')::boolean,false),payload->>'badgeText',payload->>'ctaText',coalesce((payload->>'displayOrder')::integer,0),coalesce((payload->>'trialDays')::integer,0),coalesce(payload->'limits','{}'),coalesce(payload->'features','{}'),coalesce(payload->'marketingFeatures','[]'),coalesce(payload->'regionalPrices','{}')) returning * into saved;
  insert into public.subscription_plan_changes(plan_id,admin_email,change_type,after_data,reason) values(saved.id,actor_email,'create_plan',to_jsonb(saved),change_reason);
  insert into public.admin_audit_logs(admin_email,action,target_type,target_id,metadata) values(actor_email,'create_plan','plan',saved.id::text,jsonb_build_object('slug',saved.slug));
 else
  select * into before_row from public.plans where id=target_id for update; if before_row.id is null then raise exception 'Plan not found'; end if;
  update public.plans set name=coalesce(payload->>'name',name),slug=coalesce(payload->>'slug',slug),description=coalesce(payload->>'description',description),currency=coalesce(payload->>'currency',currency),
   price_monthly=case when payload?'monthlyPrice' then nullif(payload->>'monthlyPrice','')::numeric else price_monthly end,price_yearly=case when payload?'yearlyPrice' then nullif(payload->>'yearlyPrice','')::numeric else price_yearly end,lifetime_price=case when payload?'lifetimePrice' then nullif(payload->>'lifetimePrice','')::numeric else lifetime_price end,
   is_free=coalesce((payload->>'isFree')::boolean,is_free),is_active=coalesce((payload->>'isActive')::boolean,is_active),is_public=coalesce((payload->>'isPublic')::boolean,is_public),is_featured=coalesce((payload->>'isFeatured')::boolean,is_featured),badge_text=case when payload?'badgeText' then nullif(payload->>'badgeText','') else badge_text end,cta_text=case when payload?'ctaText' then nullif(payload->>'ctaText','') else cta_text end,display_order=coalesce((payload->>'displayOrder')::integer,display_order),trial_days=coalesce((payload->>'trialDays')::integer,trial_days),limits=coalesce(payload->'limits',limits),features=coalesce(payload->'features',features),marketing_features=coalesce(payload->'marketingFeatures',marketing_features),regional_prices=coalesce(payload->'regionalPrices',regional_prices) where id=target_id returning * into saved;
  insert into public.subscription_plan_changes(plan_id,admin_email,change_type,before_data,after_data,reason) values(saved.id,actor_email,'update_plan',to_jsonb(before_row),to_jsonb(saved),change_reason);
  insert into public.admin_audit_logs(admin_email,action,target_type,target_id,metadata) values(actor_email,'update_plan','plan',saved.id::text,jsonb_build_object('slug',saved.slug,'reason',change_reason));
 end if;
 return to_jsonb(saved);
end $$;
revoke all on function public.admin_save_plan(uuid,jsonb,text) from public;
grant execute on function public.admin_save_plan(uuid,jsonb,text) to authenticated;

create or replace function public.admin_set_plan_override(target_user uuid,target_plan text,revoke boolean default false,change_reason text default null) returns void
language plpgsql security definer set search_path=public as $$
declare actor_email text:=auth.jwt()->>'email';
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 delete from public.user_plan_overrides where user_id=target_user and (expires_at is null or expires_at>now());
 if not revoke then insert into public.user_plan_overrides(user_id,plan_slug,reason,created_by_admin_email) values(target_user,target_plan,change_reason,actor_email); end if;
 insert into public.admin_audit_logs(admin_email,action,target_type,target_id,metadata) values(actor_email,case when revoke then 'revoke_premium' else 'grant_premium' end,'user',target_user::text,jsonb_build_object('plan',target_plan,'reason',change_reason));
end $$;
revoke all on function public.admin_set_plan_override(uuid,text,boolean,text) from public;
grant execute on function public.admin_set_plan_override(uuid,text,boolean,text) to authenticated;
