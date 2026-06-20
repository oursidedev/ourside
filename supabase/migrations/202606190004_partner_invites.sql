revoke all on function public.join_couple_by_invite(uuid) from public, authenticated;
drop function if exists public.join_couple_by_invite(uuid);

create table public.partner_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  token uuid not null default gen_random_uuid() unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check ((accepted_at is null) = (accepted_by is null))
);

create index partner_invites_token_idx on public.partner_invites(token);
create index partner_invites_couple_idx on public.partner_invites(couple_id, created_at desc);

alter table public.partner_invites enable row level security;

create policy "members read partner invites"
on public.partner_invites for select
using (public.is_couple_member(couple_id));

create or replace function public.enforce_couple_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from public.couples where id = new.couple_id for update;

  if exists (
    select 1 from public.couple_members
    where user_id = new.user_id and couple_id <> new.couple_id
  ) then
    raise exception 'This account already belongs to another Ourside';
  end if;

  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'This Ourside already has two members';
  end if;
  return new;
end;
$$;

create trigger enforce_couple_member_limit_trigger
before insert on public.couple_members
for each row execute function public.enforce_couple_member_limit();

create or replace function public.create_partner_invite()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_couple_id uuid;
  new_token uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select couple_id into target_couple_id
  from public.couple_members
  where user_id = auth.uid()
  limit 1;

  if target_couple_id is null then raise exception 'Create your Ourside before inviting a partner'; end if;

  perform 1 from public.couples where id = target_couple_id for update;
  if (select count(*) from public.couple_members where couple_id = target_couple_id) >= 2 then
    raise exception 'Your Ourside is complete. No more invitations can be created';
  end if;

  update public.partner_invites
  set revoked_at = now()
  where couple_id = target_couple_id and accepted_at is null and revoked_at is null;

  insert into public.partner_invites(couple_id, created_by)
  values(target_couple_id, auth.uid())
  returning token into new_token;

  return new_token;
end;
$$;

create or replace function public.get_partner_invite_preview(invitation_token uuid)
returns table(couple_name text, inviter_name text, member_count bigint, expires_at timestamptz, is_valid boolean)
language sql
stable
security definer
set search_path = public
as $$
  select c.name,
         p.display_name,
         (select count(*) from public.couple_members cm where cm.couple_id = c.id),
         i.expires_at,
         i.revoked_at is null and i.accepted_at is null and i.expires_at > now()
           and (select count(*) from public.couple_members cm where cm.couple_id = c.id) < 2
  from public.partner_invites i
  join public.couples c on c.id = i.couple_id
  join public.profiles p on p.id = i.created_by
  where i.token = invitation_token;
$$;

create or replace function public.accept_partner_invite(invitation_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_invite public.partner_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select * into target_invite
  from public.partner_invites
  where token = invitation_token
  for update;

  if target_invite.id is null or target_invite.revoked_at is not null
     or target_invite.accepted_at is not null or target_invite.expires_at <= now() then
    raise exception 'This invitation is no longer valid';
  end if;

  perform 1 from public.couples where id = target_invite.couple_id for update;

  if exists (select 1 from public.couple_members where couple_id = target_invite.couple_id and user_id = auth.uid()) then
    return target_invite.couple_id;
  end if;

  insert into public.couple_members(couple_id, user_id, role)
  values(target_invite.couple_id, auth.uid(), 'partner');

  update public.partner_invites
  set accepted_by = auth.uid(), accepted_at = now()
  where id = target_invite.id;

  update public.partner_invites
  set revoked_at = coalesce(revoked_at, now())
  where couple_id = target_invite.couple_id and id <> target_invite.id and accepted_at is null;

  return target_invite.couple_id;
end;
$$;

revoke all on function public.create_partner_invite() from public;
revoke all on function public.accept_partner_invite(uuid) from public;
revoke all on function public.get_partner_invite_preview(uuid) from public;
grant execute on function public.create_partner_invite() to authenticated;
grant execute on function public.accept_partner_invite(uuid) to authenticated;
grant execute on function public.get_partner_invite_preview(uuid) to anon, authenticated;

alter table public.couples drop column if exists invite_code;
