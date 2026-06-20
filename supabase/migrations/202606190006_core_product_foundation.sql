-- Additive product-model upgrade. Existing table/column names remain valid for the current UI.
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists timezone text not null default 'UTC';
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
create unique index if not exists profiles_username_lower_idx on public.profiles(lower(username)) where username is not null;

alter table public.user_preferences add column if not exists language text not null default 'en' check (language in ('en','tr','de','es','fr'));
alter table public.user_preferences add column if not exists notification_email_enabled boolean not null default true;
alter table public.user_preferences add column if not exists notification_push_enabled boolean not null default true;
alter table public.user_preferences add column if not exists marketing_emails_enabled boolean not null default false;

create table if not exists public.privacy_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_visibility text not null default 'partner' check (profile_visibility in ('private','partner')),
  allow_partner_invite boolean not null default true,
  allow_memory_download boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.privacy_settings(user_id) select id from public.profiles on conflict do nothing;
alter table public.privacy_settings enable row level security;
create policy "users manage own privacy" on public.privacy_settings for all using(user_id=auth.uid()) with check(user_id=auth.uid());

alter table public.couples add column if not exists slug text;
alter table public.couples add column if not exists anniversary_date date;
alter table public.couples add column if not exists timezone text not null default 'UTC';
alter table public.couples add column if not exists default_locale text not null default 'en' check(default_locale in ('en','tr','de','es','fr'));
alter table public.couples add column if not exists status text not null default 'active' check(status in ('active','archived'));
alter table public.couples add column if not exists created_by uuid references public.profiles(id) on delete set null;
update public.couples c set created_by=(select user_id from public.couple_members m where m.couple_id=c.id and m.role='owner' limit 1) where created_by is null;
create unique index if not exists couples_slug_idx on public.couples(slug) where slug is not null;
alter table public.couple_members add column if not exists status text not null default 'active' check(status in ('active','left','removed'));
alter table public.couple_members add column if not exists created_at timestamptz not null default now();
alter table public.couple_members add column if not exists updated_at timestamptz not null default now();
alter table public.partner_invites add column if not exists invited_email text;

alter table public.memories add column if not exists description text;
update public.memories set description=note where description is null;
alter table public.memories add column if not exists location_name text;
update public.memories set location_name=location where location_name is null;
alter table public.memories add column if not exists location_lat double precision;
alter table public.memories add column if not exists location_lng double precision;
alter table public.memories add column if not exists visibility text not null default 'couple' check(visibility in ('couple','private'));
create index if not exists memories_cursor_idx on public.memories(couple_id, memory_date desc, id desc);

alter table public.memory_media add column if not exists couple_id uuid references public.couples(id) on delete cascade;
alter table public.memory_media add column if not exists uploaded_by uuid references public.profiles(id) on delete set null;
alter table public.memory_media add column if not exists storage_provider text not null default 'supabase';
alter table public.memory_media add column if not exists storage_path_original text;
alter table public.memory_media add column if not exists storage_path_large text;
alter table public.memory_media add column if not exists storage_path_medium text;
alter table public.memory_media add column if not exists storage_path_thumbnail text;
alter table public.memory_media add column if not exists blur_data_url text;
alter table public.memory_media add column if not exists mime_type text;
alter table public.memory_media add column if not exists file_size bigint;
alter table public.memory_media add column if not exists width integer;
alter table public.memory_media add column if not exists height integer;
alter table public.memory_media add column if not exists duration double precision;
update public.memory_media mm set couple_id=m.couple_id, uploaded_by=m.author_id, storage_path_original=coalesce(mm.storage_path_original,mm.url) from public.memories m where m.id=mm.memory_id and (mm.couple_id is null or mm.uploaded_by is null or mm.storage_path_original is null);
create index if not exists memory_media_memory_sort_idx on public.memory_media(memory_id,sort_order);

create table if not exists public.memory_comments (
 id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
 memory_id uuid not null references public.memories(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 2000), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.memory_reactions (
 id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
 memory_id uuid not null references public.memories(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
 reaction text not null check(reaction in ('heart','love','laugh','tears','sparkles')), created_at timestamptz not null default now(), unique(memory_id,user_id)
);
alter table public.memory_comments enable row level security; alter table public.memory_reactions enable row level security;
create policy "members manage memory comments" on public.memory_comments for all using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id) and user_id=auth.uid());
create policy "members manage memory reactions" on public.memory_reactions for all using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id) and user_id=auth.uid());

alter table public.albums add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.albums add column if not exists description text;
alter table public.albums add column if not exists cover_media_id uuid references public.memory_media(id) on delete set null;
alter table public.albums add column if not exists is_favorite boolean not null default false;
alter table public.albums add column if not exists updated_at timestamptz not null default now();
alter table public.album_memories add column if not exists couple_id uuid references public.couples(id) on delete cascade;
alter table public.album_memories add column if not exists created_at timestamptz not null default now();
update public.album_memories am set couple_id=a.couple_id from public.albums a where a.id=am.album_id and am.couple_id is null;

alter table public.letters add column if not exists status text not null default 'scheduled' check(status in ('draft','scheduled','unlocked','archived'));
alter table public.letters add column if not exists attachment_media_id uuid references public.memory_media(id) on delete set null;
alter table public.letters add column if not exists updated_at timestamptz not null default now();
alter table public.milestones add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.milestones add column if not exists description text;
alter table public.milestones add column if not exists type text not null default 'custom' check(type in ('first_date','first_trip','first_i_love_you','anniversary','moving_in','custom'));
alter table public.milestones add column if not exists related_memory_id uuid references public.memories(id) on delete set null;
alter table public.milestones add column if not exists updated_at timestamptz not null default now();
alter table public.bucket_list_items add column if not exists description text;
alter table public.bucket_list_items add column if not exists status text not null default 'planned' check(status in ('planned','in_progress','completed','archived'));
alter table public.bucket_list_items add column if not exists updated_at timestamptz not null default now();

alter table public.daily_questions add column if not exists question text;
update public.daily_questions set question=prompt_key where question is null;
alter table public.daily_questions add column if not exists locale text not null default 'en' check(locale in ('en','tr','de','es','fr'));
alter table public.daily_questions add column if not exists category text not null default 'connection';
alter table public.daily_questions add column if not exists active boolean not null default true;
alter table public.daily_answers add column if not exists answer_date date;
update public.daily_answers da set answer_date=q.question_date from public.daily_questions q where q.id=da.question_id and da.answer_date is null;

alter table public.notifications add column if not exists couple_id uuid references public.couples(id) on delete cascade;
alter table public.notifications add column if not exists type text not null default 'memory_added';
alter table public.notifications add column if not exists title text;
alter table public.notifications add column if not exists body text;
alter table public.notifications add column if not exists metadata jsonb not null default '{}';
update public.notifications set title=coalesce(title,title_key), metadata=coalesce(payload,'{}'::jsonb) where title is null;

create or replace function public.reveal_daily_answers(target_couple uuid, target_question uuid, target_date date)
returns table(id uuid, user_id uuid, answer text, created_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_couple_member(target_couple) then raise exception 'Not a couple member'; end if;
 if (select count(distinct da.user_id) from public.daily_answers da join public.couple_members cm on cm.user_id=da.user_id and cm.couple_id=da.couple_id and cm.status='active' where da.couple_id=target_couple and da.question_id=target_question and da.answer_date=target_date) < 2 then return; end if;
 return query select da.id,da.user_id,da.answer,da.created_at from public.daily_answers da where da.couple_id=target_couple and da.question_id=target_question and da.answer_date=target_date;
end; $$;
revoke all on function public.reveal_daily_answers(uuid,uuid,date) from public;
grant execute on function public.reveal_daily_answers(uuid,uuid,date) to authenticated;

-- Auth metadata is copied for product queries; auth.users remains the source of truth.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare first_name text; last_name text; display_name text; provider_name text;
begin
 provider_name:=coalesce(nullif(new.raw_user_meta_data->>'full_name',''),nullif(new.raw_user_meta_data->>'name',''));
 first_name:=coalesce(nullif(new.raw_user_meta_data->>'first_name',''),nullif(new.raw_user_meta_data->>'given_name',''),nullif(split_part(provider_name,' ',1),''),split_part(new.email,'@',1));
 last_name:=coalesce(nullif(new.raw_user_meta_data->>'last_name',''),nullif(new.raw_user_meta_data->>'family_name',''),nullif(trim(substr(provider_name,length(split_part(provider_name,' ',1))+1)),''));
 display_name:=coalesce(nullif(trim(concat_ws(' ',first_name,last_name)),''),split_part(new.email,'@',1));
 insert into public.profiles(id,display_name,first_name,last_name,avatar_url,email) values(new.id,display_name,first_name,last_name,coalesce(new.raw_user_meta_data->>'avatar_url',new.raw_user_meta_data->>'picture'),new.email);
 insert into public.user_preferences(user_id) values(new.id); insert into public.privacy_settings(user_id) values(new.id); return new;
end; $$;
