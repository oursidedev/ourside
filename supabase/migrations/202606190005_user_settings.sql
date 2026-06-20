create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  memory_reminders boolean not null default true,
  important_dates boolean not null default true,
  letter_unlocks boolean not null default true,
  theme text not null default 'light' check (theme in ('light','dark','system')),
  date_format text not null default 'regional' check (date_format in ('regional','day_first','month_first')),
  updated_at timestamptz not null default now()
);

insert into public.user_preferences(user_id)
select id from public.profiles
on conflict(user_id) do nothing;

alter table public.user_preferences enable row level security;
create policy "users read own preferences" on public.user_preferences for select using(user_id = auth.uid());
create policy "users update own preferences" on public.user_preferences for update using(user_id = auth.uid()) with check(user_id = auth.uid());
create policy "users insert own preferences" on public.user_preferences for insert with check(user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_first_name text;
  resolved_last_name text;
  resolved_display_name text;
  provider_full_name text;
begin
  provider_full_name := coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), nullif(new.raw_user_meta_data->>'name', ''));
  resolved_first_name := coalesce(nullif(new.raw_user_meta_data->>'first_name', ''), nullif(new.raw_user_meta_data->>'given_name', ''), nullif(split_part(provider_full_name, ' ', 1), ''), split_part(new.email, '@', 1));
  resolved_last_name := coalesce(nullif(new.raw_user_meta_data->>'last_name', ''), nullif(new.raw_user_meta_data->>'family_name', ''), nullif(trim(substr(provider_full_name, length(split_part(provider_full_name, ' ', 1)) + 1)), ''));
  resolved_display_name := coalesce(nullif(trim(concat_ws(' ', resolved_first_name, resolved_last_name)), ''), split_part(new.email, '@', 1));
  insert into public.profiles(id, display_name, first_name, last_name, avatar_url)
  values(new.id, resolved_display_name, resolved_first_name, resolved_last_name, coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'));
  insert into public.user_preferences(user_id) values(new.id);
  return new;
end;
$$;

create or replace function public.disconnect_partner()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  membership public.couple_members%rowtype;
begin
  select * into membership from public.couple_members where user_id = auth.uid() limit 1;
  if membership.id is null then raise exception 'No Ourside membership found'; end if;
  if membership.role = 'owner' then
    delete from public.couple_members where couple_id = membership.couple_id and user_id <> auth.uid();
  else
    delete from public.couple_members where id = membership.id;
  end if;
  update public.partner_invites set revoked_at = coalesce(revoked_at, now()) where couple_id = membership.couple_id and accepted_at is null;
end;
$$;

create or replace function public.delete_my_account(confirmation text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  membership public.couple_members%rowtype;
  member_count integer;
begin
  if confirmation <> 'DELETE' then raise exception 'Invalid confirmation'; end if;
  select * into membership from public.couple_members where user_id = auth.uid() limit 1;
  if membership.id is not null then
    select count(*) into member_count from public.couple_members where couple_id = membership.couple_id;
    if membership.role = 'owner' and member_count > 1 then
      update public.couple_members set role = 'owner' where couple_id = membership.couple_id and user_id <> auth.uid();
    elsif member_count = 1 then
      delete from public.couples where id = membership.couple_id;
    end if;
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.disconnect_partner() from public;
revoke all on function public.delete_my_account(text) from public;
grant execute on function public.disconnect_partner() to authenticated;
grant execute on function public.delete_my_account(text) to authenticated;
