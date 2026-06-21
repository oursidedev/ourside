-- A plan belongs to the Ourside couple, not to only the member selected in the
-- admin UI. Keep both active members on the same override and notify each one.
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
  target_couple uuid;
  previous_plan text;
  created_notification uuid;
  recipient record;
  recipients jsonb := '[]'::jsonb;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into selected_plan from public.plans where slug=target_plan and is_active limit 1;
  if selected_plan.id is null then raise exception 'Active plan not found'; end if;
  if not exists(select 1 from auth.users where id=target_user) then raise exception 'User not found'; end if;

  select couple_id into target_couple from public.couple_members where user_id=target_user and status='active' limit 1;
  if target_couple is not null then previous_plan:=public.effective_couple_plan(target_couple);
  else
    select coalesce(
      (select plan_slug from public.user_plan_overrides where user_id=target_user and (expires_at is null or expires_at>now()) order by created_at desc limit 1),
      (select plans.slug from public.subscriptions subscriptions join public.plans plans on plans.id=subscriptions.plan_id where subscriptions.user_id=target_user and subscriptions.status in('active','trialing') order by subscriptions.updated_at desc limit 1),
      'free') into previous_plan;
  end if;

  if target_couple is not null then
    delete from public.user_plan_overrides where user_id in(select user_id from public.couple_members where couple_id=target_couple and status='active') and (expires_at is null or expires_at>now());
    insert into public.user_plan_overrides(user_id,plan_slug,reason,created_by_admin_email)
      select user_id,selected_plan.slug,change_reason,actor_email from public.couple_members where couple_id=target_couple and status='active';
  else
    delete from public.user_plan_overrides where user_id=target_user and (expires_at is null or expires_at>now());
    insert into public.user_plan_overrides(user_id,plan_slug,reason,created_by_admin_email) values(target_user,selected_plan.slug,change_reason,actor_email);
  end if;

  for recipient in
    select users.id as user_id,users.email::text as email,profiles.display_name::text as display_name
    from auth.users users left join public.profiles profiles on profiles.id=users.id
    where (target_couple is not null and users.id in(select user_id from public.couple_members where couple_id=target_couple and status='active'))
       or (target_couple is null and users.id=target_user)
  loop
    insert into public.notifications(user_id,couple_id,type,title,title_key,body,action_url,metadata,payload)
      values(recipient.user_id,target_couple,case when selected_plan.is_free then 'subscription_cancelled' else 'subscription_started' end,
        'Your Ourside plan changed','plan_changed','Your shared plan is now '||selected_plan.name||'. Access has been updated for both of you.',
        '/settings',jsonb_build_object('fromPlan',previous_plan,'toPlan',selected_plan.slug),jsonb_build_object('fromPlan',previous_plan,'toPlan',selected_plan.slug))
      returning id into created_notification;
    insert into public.notification_delivery_logs(notification_id,user_id,channel,provider,status,sent_at)
      values(created_notification,recipient.user_id,'in_app','supabase','sent',now());
    recipients:=recipients||jsonb_build_array(jsonb_build_object('userId',recipient.user_id,'email',recipient.email,'displayName',recipient.display_name,'notificationId',created_notification));
  end loop;

  insert into public.admin_audit_logs(admin_email,action,target_type,target_id,metadata)
    values(actor_email,'change_couple_plan',case when target_couple is null then 'user' else 'couple' end,coalesce(target_couple,target_user)::text,
      jsonb_build_object('fromPlan',previous_plan,'toPlan',selected_plan.slug,'reason',change_reason,'recipientCount',jsonb_array_length(recipients)));

  return jsonb_build_object('coupleId',target_couple,'fromPlan',previous_plan,'toPlan',selected_plan.slug,'toPlanName',selected_plan.name,'recipients',recipients);
end;
$$;

revoke all on function public.admin_assign_user_plan(uuid,text,text) from public;
grant execute on function public.admin_assign_user_plan(uuid,text,text) to authenticated;
