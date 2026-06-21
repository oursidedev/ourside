-- auth.users.email is varchar(255), while the privacy-safe admin RPC promises
-- text. PostgreSQL requires an exact return type match for RETURN QUERY.
create or replace function public.admin_list_users(
  search_text text default '',
  row_limit integer default 100
)
returns table(
  id uuid,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz,
  email_verified boolean,
  couple_id uuid,
  plan_slug text,
  memory_count bigint,
  media_count bigint
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
    users.id,
    users.email::text,
    profiles.display_name::text,
    profiles.avatar_url::text,
    users.created_at,
    users.email_confirmed_at is not null,
    members.couple_id,
    coalesce((
      select plans.slug::text
      from public.subscriptions subscriptions
      join public.plans plans on plans.id = subscriptions.plan_id
      where subscriptions.user_id = users.id
        and subscriptions.status in ('active', 'trialing')
      order by subscriptions.updated_at desc
      limit 1
    ), 'free'::text),
    (select count(*) from public.memories memories where memories.couple_id = members.couple_id),
    (select count(*) from public.memory_media media where media.couple_id = members.couple_id)
  from auth.users users
  left join public.profiles profiles on profiles.id = users.id
  left join public.couple_members members
    on members.user_id = users.id and members.status = 'active'
  where search_text = ''
    or users.email ilike '%' || search_text || '%'
    or profiles.display_name ilike '%' || search_text || '%'
  order by users.created_at desc
  limit least(row_limit, 250);
end;
$$;

revoke all on function public.admin_list_users(text, integer) from public;
grant execute on function public.admin_list_users(text, integer) to authenticated;
