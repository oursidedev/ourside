alter table public.profiles add column if not exists avatar_updated_at timestamptz;
alter table public.profiles add column if not exists display_name_updated_at timestamptz;

create table if not exists public.account_change_logs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  change_type text not null check(change_type in('avatar_update','display_name_update','password_change','email_change')),
  changed_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'
);
create index if not exists idx_account_change_logs_user_type_changed on public.account_change_logs(user_id,change_type,changed_at desc);
alter table public.account_change_logs enable row level security;
create policy "users read own account change logs" on public.account_change_logs for select to authenticated using(user_id=auth.uid());

create or replace function public.account_change_cooldown(change_kind text) returns interval language sql immutable as $$
 select case change_kind when 'avatar_update' then interval '10 minutes' when 'display_name_update' then interval '24 hours' when 'password_change' then interval '10 minutes' else interval '0 seconds' end;
$$;
create or replace function public.get_account_change_status(change_kind text)
returns table(allowed boolean,remaining_seconds integer,last_changed_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare last_change timestamptz; cooldown interval;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if change_kind not in('avatar_update','display_name_update','password_change','email_change') then raise exception 'Unsupported account change type';end if;
 cooldown:=public.account_change_cooldown(change_kind);
 select max(changed_at) into last_change from public.account_change_logs where user_id=auth.uid() and change_type=change_kind;
 return query select last_change is null or last_change+cooldown<=now(),greatest(0,ceil(extract(epoch from coalesce(last_change+cooldown-now(),interval '0 seconds')))::integer),last_change;
end $$;

create or replace function public.update_my_display_name(new_display_name text)
returns text language plpgsql security definer set search_path=public as $$
declare normalized text;status_row record;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 normalized:=regexp_replace(trim(new_display_name),'[[:space:]]+',' ','g');
 if char_length(normalized)<2 or char_length(normalized)>40 then raise exception 'Display name must be between 2 and 40 characters';end if;
 if normalized !~ '^[[:alnum:][:space:]''\.\-]+$' or normalized !~ '[[:alnum:]]' then raise exception 'Display name contains unsupported characters';end if;
 select * into status_row from public.get_account_change_status('display_name_update');
 if not status_row.allowed then raise exception 'COOLDOWN:%',status_row.remaining_seconds;end if;
 update public.profiles set display_name=normalized,display_name_updated_at=now(),updated_at=now() where id=auth.uid();
 insert into public.account_change_logs(user_id,change_type,metadata) values(auth.uid(),'display_name_update',jsonb_build_object('length',char_length(normalized)));
 return normalized;
end $$;

create or replace function public.commit_my_avatar_update(storage_path text)
returns void language plpgsql security definer set search_path=public as $$
declare status_row record;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if storage_path is not null and storage_path !~ ('^users/'||auth.uid()::text||'/avatar/avatar-(small|medium|large)\.webp$') then raise exception 'Invalid avatar path';end if;
 select * into status_row from public.get_account_change_status('avatar_update');
 if not status_row.allowed then raise exception 'COOLDOWN:%',status_row.remaining_seconds;end if;
 update public.profiles set avatar_url=storage_path,avatar_updated_at=now(),updated_at=now() where id=auth.uid();
 insert into public.account_change_logs(user_id,change_type,metadata) values(auth.uid(),'avatar_update',jsonb_build_object('removed',storage_path is null));
end $$;

create or replace function public.record_my_password_change()
returns void language plpgsql security definer set search_path=public as $$
declare status_row record;
begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 select * into status_row from public.get_account_change_status('password_change');
 if not status_row.allowed then raise exception 'COOLDOWN:%',status_row.remaining_seconds;end if;
 insert into public.account_change_logs(user_id,change_type,metadata) values(auth.uid(),'password_change','{}');
 insert into public.notifications(user_id,actor_user_id,type,title,title_key,body,action_url,metadata,payload)
 values(auth.uid(),auth.uid(),'password_changed','Your password was changed','password_changed','If this wasn''t you, secure your account immediately.','/settings','{}','{}');
end $$;

create or replace function public.dispatch_profile_security_notification(input_type text)
returns void language plpgsql security definer set search_path=public as $$ declare notification_title text;notification_body text;begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if input_type not in('profile_photo_updated','display_name_updated') then raise exception 'Unsupported notification type';end if;
 if input_type='profile_photo_updated' then notification_title:='Profile photo updated';notification_body:='Your new profile photo is now visible in Ourside.';else notification_title:='Display name updated';notification_body:='Your new name is now shown across your shared space.';end if;
 insert into public.notifications(user_id,actor_user_id,type,title,title_key,body,action_url,metadata,payload)
 values(auth.uid(),auth.uid(),input_type,notification_title,input_type,notification_body,'/settings','{}','{}');
end $$;

grant execute on function public.get_account_change_status(text) to authenticated;
grant execute on function public.update_my_display_name(text) to authenticated;
grant execute on function public.commit_my_avatar_update(text) to authenticated;
grant execute on function public.record_my_password_change() to authenticated;
grant execute on function public.dispatch_profile_security_notification(text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('profile-media','profile-media',false,5242880,array['image/webp']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create or replace function public.can_read_profile_avatar(object_name text) returns boolean language sql stable security definer set search_path=public,storage as $$
 select case when object_name~'^users/[0-9a-f-]{36}/avatar/avatar-(small|medium|large)\.webp$' then
  auth.uid()=(storage.foldername(object_name))[2]::uuid or exists(select 1 from public.couple_members mine join public.couple_members theirs on theirs.couple_id=mine.couple_id where mine.user_id=auth.uid() and theirs.user_id=(storage.foldername(object_name))[2]::uuid)
 else false end;
$$;
create policy "users read shared profile avatars" on storage.objects for select to authenticated using(bucket_id='profile-media' and public.can_read_profile_avatar(name));
create policy "users upload own profile avatars" on storage.objects for insert to authenticated with check(bucket_id='profile-media' and name~('^users/'||auth.uid()::text||'/avatar/avatar-(small|medium|large)\.webp$'));
create policy "users update own profile avatars" on storage.objects for update to authenticated using(bucket_id='profile-media' and name~('^users/'||auth.uid()::text||'/avatar/avatar-(small|medium|large)\.webp$')) with check(bucket_id='profile-media' and name~('^users/'||auth.uid()::text||'/avatar/avatar-(small|medium|large)\.webp$'));
create policy "users delete own profile avatars" on storage.objects for delete to authenticated using(bucket_id='profile-media' and name~('^users/'||auth.uid()::text||'/avatar/avatar-(small|medium|large)\.webp$'));
