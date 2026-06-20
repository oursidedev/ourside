drop policy if exists "authenticated create couple" on public.couples;
drop policy if exists "self joins couple" on public.couple_members;

create or replace function public.create_couple_space(
  space_name text,
  relationship_start_date date,
  space_cover_url text default null,
  space_style public.couple_style default 'warm'
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_couple_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(trim(space_name)) < 1 or char_length(space_name) > 100 then
    raise exception 'Invalid couple name';
  end if;

  insert into public.couples(name, start_date, cover_url, style)
  values(trim(space_name), relationship_start_date, space_cover_url, space_style)
  returning id into new_couple_id;

  insert into public.couple_members(couple_id, user_id, role)
  values(new_couple_id, auth.uid(), 'owner');

  return new_couple_id;
end;
$$;

create or replace function public.join_couple_by_invite(invitation_code uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_couple_id uuid;
  member_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select id into target_couple_id
  from public.couples
  where invite_code = invitation_code
  for update;

  if target_couple_id is null then
    raise exception 'Invalid invitation';
  end if;

  if exists (
    select 1 from public.couple_members
    where couple_id = target_couple_id and user_id = auth.uid()
  ) then
    return target_couple_id;
  end if;

  select count(*) into member_count
  from public.couple_members
  where couple_id = target_couple_id;

  if member_count >= 2 then
    raise exception 'This couple space already has two members';
  end if;

  insert into public.couple_members(couple_id, user_id, role)
  values(target_couple_id, auth.uid(), 'partner');

  return target_couple_id;
end;
$$;

revoke all on function public.create_couple_space(text,date,text,public.couple_style) from public;
revoke all on function public.join_couple_by_invite(uuid) from public;
grant execute on function public.create_couple_space(text,date,text,public.couple_style) to authenticated;
grant execute on function public.join_couple_by_invite(uuid) to authenticated;

create policy "owners delete couple"
on public.couples for delete
using (
  exists (
    select 1 from public.couple_members
    where couple_id = couples.id
      and user_id = auth.uid()
      and role = 'owner'
  )
);
