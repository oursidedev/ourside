create extension if not exists "pgcrypto";

create type public.couple_role as enum ('owner','partner');
create type public.memory_type as enum ('photo','note','video');
create type public.media_type as enum ('image','video','audio');
create type public.couple_style as enum ('classic','warm','minimal');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  locale text not null default 'en' check (locale in ('en','tr','de','es','fr')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.couples (
  id uuid primary key default gen_random_uuid(), name text not null,
  start_date date not null, cover_url text, style public.couple_style not null default 'warm',
  invite_code uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.couple_members (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, role public.couple_role not null,
  joined_at timestamptz not null default now(), unique(couple_id,user_id)
);
create table public.memories (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id), title text not null, note text not null default '',
  memory_date date not null, type public.memory_type not null default 'photo', location text, mood text,
  is_favorite boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.memory_media (
  id uuid primary key default gen_random_uuid(), memory_id uuid not null references public.memories(id) on delete cascade,
  url text not null, type public.media_type not null, alt_text text not null default '', sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.albums (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, cover_url text, created_at timestamptz not null default now()
);
create table public.album_memories (
  album_id uuid references public.albums(id) on delete cascade, memory_id uuid references public.memories(id) on delete cascade,
  primary key(album_id,memory_id)
);
create table public.letters (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(id), recipient_id uuid references public.profiles(id),
  title text not null, encrypted_body text not null, unlock_at timestamptz not null,
  attachment_url text, voice_url text, created_at timestamptz not null default now(), opened_at timestamptz
);
create table public.milestones (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null, milestone_date date not null, icon text not null default 'heart', note text,
  created_at timestamptz not null default now()
);
create table public.bucket_list_items (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references public.profiles(id), title text not null,
  category text not null check(category in ('Travel','Food','Experiences','Home','Dreams','Random')),
  completed_at timestamptz, completion_memory_id uuid references public.memories(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.daily_questions (
  id uuid primary key default gen_random_uuid(), prompt_key text not null, question_date date not null unique, created_at timestamptz not null default now()
);
create table public.daily_answers (
  id uuid primary key default gen_random_uuid(), question_id uuid not null references public.daily_questions(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade, user_id uuid not null references public.profiles(id),
  answer text not null, created_at timestamptz not null default now(), unique(question_id,user_id)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title_key text not null, payload jsonb not null default '{}', read_at timestamptz, created_at timestamptz not null default now()
);

create index memories_couple_date_idx on public.memories(couple_id,memory_date desc);
create index letters_couple_unlock_idx on public.letters(couple_id,unlock_at);
create index notifications_user_created_idx on public.notifications(user_id,created_at desc);

create function public.is_couple_member(target_couple uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.couple_members where couple_id=target_couple and user_id=auth.uid());
$$;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security; alter table public.couples enable row level security;
alter table public.couple_members enable row level security; alter table public.memories enable row level security;
alter table public.memory_media enable row level security; alter table public.albums enable row level security;
alter table public.album_memories enable row level security; alter table public.letters enable row level security;
alter table public.milestones enable row level security; alter table public.bucket_list_items enable row level security;
alter table public.daily_questions enable row level security; alter table public.daily_answers enable row level security;
alter table public.notifications enable row level security;

create policy "profile owner read" on public.profiles for select using(id=auth.uid() or exists(select 1 from public.couple_members me join public.couple_members them on me.couple_id=them.couple_id where me.user_id=auth.uid() and them.user_id=profiles.id));
create policy "profile owner update" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());
create policy "members read couple" on public.couples for select using(public.is_couple_member(id));
create policy "authenticated create couple" on public.couples for insert to authenticated with check(true);
create policy "members update couple" on public.couples for update using(public.is_couple_member(id));
create policy "members read membership" on public.couple_members for select using(public.is_couple_member(couple_id));
create policy "self joins couple" on public.couple_members for insert to authenticated with check(user_id=auth.uid());

create policy "members manage memories" on public.memories for all using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id) and author_id=auth.uid());
create policy "members manage media" on public.memory_media for all using(exists(select 1 from public.memories m where m.id=memory_id and public.is_couple_member(m.couple_id))) with check(exists(select 1 from public.memories m where m.id=memory_id and public.is_couple_member(m.couple_id)));
create policy "members manage albums" on public.albums for all using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id));
create policy "members manage album memories" on public.album_memories for all using(exists(select 1 from public.albums a where a.id=album_id and public.is_couple_member(a.couple_id))) with check(exists(select 1 from public.albums a where a.id=album_id and public.is_couple_member(a.couple_id)));
create policy "members read unlocked letters" on public.letters for select using(public.is_couple_member(couple_id) and (author_id=auth.uid() or unlock_at<=now()));
create policy "members create letters" on public.letters for insert with check(public.is_couple_member(couple_id) and author_id=auth.uid());
create policy "authors update letters" on public.letters for update using(author_id=auth.uid() and opened_at is null);
create policy "authors delete letters" on public.letters for delete using(author_id=auth.uid() and opened_at is null);
create policy "members manage milestones" on public.milestones for all using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id));
create policy "members manage bucket list" on public.bucket_list_items for all using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id));
create policy "authenticated read questions" on public.daily_questions for select to authenticated using(true);
create policy "members manage answers" on public.daily_answers for all using(public.is_couple_member(couple_id) and user_id=auth.uid()) with check(public.is_couple_member(couple_id) and user_id=auth.uid());
create policy "users read own notifications" on public.notifications for select using(user_id=auth.uid());
create policy "users update own notifications" on public.notifications for update using(user_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('couple-media','couple-media',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4','audio/mpeg','audio/mp4']) on conflict(id) do nothing;
create policy "members read couple media" on storage.objects for select using(bucket_id='couple-media' and public.is_couple_member((storage.foldername(name))[1]::uuid));
create policy "members upload couple media" on storage.objects for insert to authenticated with check(bucket_id='couple-media' and public.is_couple_member((storage.foldername(name))[1]::uuid));
create policy "members update couple media" on storage.objects for update using(bucket_id='couple-media' and public.is_couple_member((storage.foldername(name))[1]::uuid));
create policy "members delete couple media" on storage.objects for delete using(bucket_id='couple-media' and public.is_couple_member((storage.foldername(name))[1]::uuid));
