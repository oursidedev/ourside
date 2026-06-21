-- Admin plan selection is an explicit effective-plan assignment. Free is stored
-- as an override too, otherwise an older paid subscription could reappear after
-- a downgrade and the UI would disagree with database permission checks.
create or replace function public.admin_assign_user_plan(
  target_user uuid,
  target_plan text,
  change_reason text default null
) returns jsonb
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  actor_email text := auth.jwt()->>'email';
  selected_plan public.plans;
  target_email text;
  target_name text;
  target_couple uuid;
  previous_plan text;
  created_notification uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  select * into selected_plan from public.plans where slug=target_plan and is_active limit 1;
  if selected_plan.id is null then raise exception 'Active plan not found'; end if;
  select users.email::text, profiles.display_name::text into target_email,target_name
    from auth.users users left join public.profiles profiles on profiles.id=users.id
    where users.id=target_user;
  if target_email is null then raise exception 'User not found'; end if;
  select couple_id into target_couple from public.couple_members where user_id=target_user and status='active' limit 1;

  if target_couple is not null then previous_plan:=public.effective_couple_plan(target_couple);
  else
    select coalesce(
      (select plan_slug from public.user_plan_overrides where user_id=target_user and (expires_at is null or expires_at>now()) order by created_at desc limit 1),
      (select plans.slug from public.subscriptions subscriptions join public.plans plans on plans.id=subscriptions.plan_id where subscriptions.user_id=target_user and subscriptions.status in('active','trialing') order by subscriptions.updated_at desc limit 1),
      'free') into previous_plan;
  end if;

  delete from public.user_plan_overrides where user_id=target_user and (expires_at is null or expires_at>now());
  insert into public.user_plan_overrides(user_id,plan_slug,reason,created_by_admin_email)
    values(target_user,selected_plan.slug,change_reason,actor_email);

  insert into public.admin_audit_logs(admin_email,action,target_type,target_id,metadata)
    values(actor_email,'change_user_plan','user',target_user::text,jsonb_build_object('fromPlan',previous_plan,'toPlan',selected_plan.slug,'reason',change_reason));

  insert into public.notifications(user_id,couple_id,type,title,title_key,body,action_url,metadata,payload)
    values(target_user,target_couple,case when selected_plan.is_free then 'subscription_cancelled' else 'subscription_started' end,
      'Your Ourside plan changed','plan_changed','Your plan is now '||selected_plan.name||'. Your access has been updated immediately.',
      '/settings',jsonb_build_object('fromPlan',previous_plan,'toPlan',selected_plan.slug),jsonb_build_object('fromPlan',previous_plan,'toPlan',selected_plan.slug))
    returning id into created_notification;
  insert into public.notification_delivery_logs(notification_id,user_id,channel,provider,status,sent_at)
    values(created_notification,target_user,'in_app','supabase','sent',now());

  return jsonb_build_object('email',target_email,'displayName',target_name,'fromPlan',previous_plan,'toPlan',selected_plan.slug,'toPlanName',selected_plan.name,'notificationId',created_notification);
end;
$$;

create or replace function public.admin_record_plan_email(
  target_user uuid,
  target_notification uuid,
  delivery_status text,
  provider_id text default null,
  error_message text default null
) returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if delivery_status not in ('sent','failed') then raise exception 'Invalid delivery status'; end if;
  insert into public.notification_delivery_logs(notification_id,user_id,channel,provider,status,error_message,sent_at)
    values(target_notification,target_user,'email','resend',delivery_status,left(error_message,500),case when delivery_status='sent' then now() end);
  insert into public.notification_logs(notification_id,user_id,channel,provider,status,error_summary,sent_at)
    values(target_notification,target_user,'email','resend',delivery_status,left(error_message,500),case when delivery_status='sent' then now() end);
  insert into public.admin_audit_logs(admin_email,action,target_type,target_id,metadata)
    values(auth.jwt()->>'email','plan_change_email','user',target_user::text,jsonb_build_object('status',delivery_status,'providerId',provider_id));
end;
$$;

revoke all on function public.admin_assign_user_plan(uuid,text,text) from public;
revoke all on function public.admin_record_plan_email(uuid,uuid,text,text,text) from public;
grant execute on function public.admin_assign_user_plan(uuid,text,text) to authenticated;
grant execute on function public.admin_record_plan_email(uuid,uuid,text,text,text) to authenticated;

-- The admin list must display the same effective plan used by quota and feature
-- checks, including manual Free assignments and custom plans.
create or replace function public.admin_list_users(search_text text default '',row_limit integer default 100)
returns table(id uuid,email text,display_name text,avatar_url text,created_at timestamptz,email_verified boolean,couple_id uuid,plan_slug text,memory_count bigint,media_count bigint)
language plpgsql stable security definer set search_path=public,auth as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  return query
  select users.id,users.email::text,profiles.display_name::text,profiles.avatar_url::text,users.created_at,users.email_confirmed_at is not null,members.couple_id,
    case when members.couple_id is not null then public.effective_couple_plan(members.couple_id)
    else coalesce(
      (select overrides.plan_slug from public.user_plan_overrides overrides where overrides.user_id=users.id and (overrides.expires_at is null or overrides.expires_at>now()) order by overrides.created_at desc limit 1),
      (select plans.slug from public.subscriptions subscriptions join public.plans plans on plans.id=subscriptions.plan_id where subscriptions.user_id=users.id and subscriptions.status in('active','trialing') order by subscriptions.updated_at desc limit 1),'free') end::text,
    (select count(*) from public.memories memories where memories.couple_id=members.couple_id),
    (select count(*) from public.memory_media media where media.couple_id=members.couple_id)
  from auth.users users left join public.profiles profiles on profiles.id=users.id
  left join public.couple_members members on members.user_id=users.id and members.status='active'
  where search_text='' or users.email ilike '%'||search_text||'%' or profiles.display_name ilike '%'||search_text||'%'
  order by users.created_at desc limit least(row_limit,250);
end;
$$;
revoke all on function public.admin_list_users(text,integer) from public;
grant execute on function public.admin_list_users(text,integer) to authenticated;
