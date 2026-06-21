-- auth.users.email is varchar(255). Admin RPC return contracts use text, so
-- cast provider-owned varchar fields explicitly to keep RETURN QUERY stable.
create or replace function public.admin_list_invites(row_limit integer default 100)
returns table(
  id uuid,
  couple_id uuid,
  inviter_email text,
  status text,
  created_at timestamptz,
  accepted_at timestamptz,
  expires_at timestamptz,
  masked_code text
)
language plpgsql
stable
security definer
set search_path=public,auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    invitations.id,
    invitations.couple_id,
    users.email::text,
    invitations.status::text,
    invitations.created_at,
    invitations.accepted_at,
    invitations.expires_at,
    case
      when invitations.invite_code is null then null::text
      else (left(invitations.invite_code, 4) || '…' || right(invitations.invite_code, 2))::text
    end
  from public.partner_invites invitations
  left join auth.users users on users.id = invitations.created_by
  order by invitations.created_at desc
  limit least(row_limit, 250);
end;
$$;

revoke all on function public.admin_list_invites(integer) from public;
grant execute on function public.admin_list_invites(integer) to authenticated;
