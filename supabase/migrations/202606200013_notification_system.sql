alter table public.notifications add column if not exists actor_user_id uuid references public.profiles(id) on delete set null;
alter table public.notifications add column if not exists action_url text;
alter table public.notifications add column if not exists archived_at timestamptz;

create table if not exists public.notification_preferences(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,channel text not null check(channel in('in_app','email','push')),type text not null,enabled boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,channel,type));
create table if not exists public.notification_events(id uuid primary key default gen_random_uuid(),event_key text not null,event_type text not null,actor_user_id uuid references public.profiles(id) on delete set null,recipient_user_id uuid not null references public.profiles(id) on delete cascade,couple_id uuid references public.couples(id) on delete cascade,source_entity_type text,source_entity_id text,metadata jsonb not null default '{}',dedupe_key text not null unique,created_at timestamptz not null default now());
create table if not exists public.notification_delivery_logs(id uuid primary key default gen_random_uuid(),notification_id uuid references public.notifications(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,channel text not null check(channel in('in_app','email','push')),provider text not null,status text not null check(status in('pending','sent','failed','skipped')),error_message text,sent_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.notification_devices(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,platform text not null check(platform in('web','ios','android')),push_provider text not null,push_token text not null unique,device_name text,last_seen_at timestamptz not null default now(),revoked_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.email_unsubscribes(id uuid primary key default gen_random_uuid(),user_id uuid references public.profiles(id) on delete cascade,email text not null,type text not null,unsubscribed_at timestamptz not null default now(),created_at timestamptz not null default now(),unique(email,type));
create index if not exists notification_events_recipient_idx on public.notification_events(recipient_user_id,created_at desc);
create index if not exists delivery_logs_notification_idx on public.notification_delivery_logs(notification_id,channel);
create index if not exists notification_devices_user_idx on public.notification_devices(user_id) where revoked_at is null;

alter table public.notification_preferences enable row level security;alter table public.notification_events enable row level security;alter table public.notification_delivery_logs enable row level security;alter table public.notification_devices enable row level security;alter table public.email_unsubscribes enable row level security;
create policy "users manage notification preferences" on public.notification_preferences for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users manage notification devices" on public.notification_devices for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users read own delivery logs" on public.notification_delivery_logs for select using(user_id=auth.uid());
create policy "users manage own email unsubscribes" on public.email_unsubscribes for all using(user_id=auth.uid()) with check(user_id=auth.uid());
-- notification_events stays server-only: dedupe and recipient routing must not be client-controlled.

create or replace function public.notification_copy(input_type text,out title text,out body text,out action_prefix text) returns record language plpgsql immutable set search_path=public as $$ begin
 case input_type
 when 'welcome' then title:='Welcome to Ourside';body:='Your private space for the moments that matter is ready.';
 when 'couple_created' then title:='Your Ourside is ready';body:='Invite your partner and start saving your story together.';
 when 'partner_invited' then title:='Invite created';body:='Your invite link and code are ready to share.';
 when 'invitation_accepted_by_me' then title:='You joined an Ourside';body:='You are now part of a private space made for two.';
 when 'partner_joined' then title:='Your partner joined Ourside';body:='Your shared space is now ready for both of you.';
 when 'memory_added' then title:='A new memory was added';body:='Your partner added a new moment to your Ourside.';action_prefix:='/memories/';
 when 'memory_commented' then title:='New comment on a memory';body:='Your partner left a private note on one of your memories.';action_prefix:='/memories/';
 when 'memory_reacted' then title:='Your partner reacted to a memory';body:='A memory just got a little more special.';action_prefix:='/memories/';
 when 'letter_created' then title:='A future letter is waiting';body:='Your partner wrote something you will be able to open later.';action_prefix:='/vault';
 when 'letter_unlocked' then title:='A letter is now unlocked';body:='A message from your partner is ready to open.';action_prefix:='/vault';
 when 'milestone_created' then title:='A milestone was added';body:='Your partner added a special date to your story.';action_prefix:='/milestones';
 when 'milestone_reminder' then title:='A special date is coming up';body:='Your milestone is almost here.';action_prefix:='/milestones';
 when 'anniversary_reminder' then title:='Your anniversary is coming up';body:='Another chapter of your story is almost here.';action_prefix:='/milestones';
 when 'bucket_item_added' then title:='New plan added';body:='Your partner added something to your shared bucket list.';action_prefix:='/bucket-list';
 when 'bucket_item_completed' then title:='You completed a shared plan';body:='Turn this moment into a memory.';action_prefix:='/bucket-list';
 when 'daily_question_available' then title:='Today''s question is ready';body:='Answer today''s question and see what your partner says.';action_prefix:='/dashboard';
 when 'daily_question_answered_by_partner' then title:='Your partner answered today''s question';body:='Answer yours to reveal both responses.';action_prefix:='/dashboard';
 when 'daily_question_both_answered' then title:='Your answers are ready';body:='You can now see what both of you wrote.';action_prefix:='/dashboard';
 when 'profile_updated' then title:='Profile updated';body:='Your Ourside profile details were changed.';action_prefix:='/settings';
 when 'password_changed' then title:='Password changed';body:='Your password was updated securely.';action_prefix:='/settings';
 else title:='Something new in Ourside';body:='Open your private space to see what changed.';action_prefix:='/dashboard';end case;end $$;

create or replace function public.emit_notification(recipient uuid,actor uuid,target_couple uuid,input_type text,source_type text,source_id text,event_metadata jsonb default '{}') returns uuid language plpgsql security definer set search_path=public as $$
declare copy record;event_id uuid;notification_id uuid;dedupe text;in_app_enabled boolean;email_enabled boolean;
begin
 if recipient is null then return null;end if;
 dedupe:=input_type||':'||coalesce(source_id,target_couple::text,actor::text,'global')||':'||recipient::text;
 insert into public.notification_events(event_key,event_type,actor_user_id,recipient_user_id,couple_id,source_entity_type,source_entity_id,metadata,dedupe_key) values(dedupe,input_type,actor,recipient,target_couple,source_type,source_id,coalesce(event_metadata,'{}'),dedupe) on conflict(dedupe_key) do nothing returning id into event_id;
 if event_id is null then return null;end if;
 select coalesce((select enabled from public.notification_preferences where user_id=recipient and channel='in_app' and type=input_type),(select enabled from public.notification_preferences where user_id=recipient and channel='in_app' and type='*'),true) into in_app_enabled;
 select coalesce((select enabled from public.notification_preferences where user_id=recipient and channel='email' and type=input_type),(select enabled from public.notification_preferences where user_id=recipient and channel='email' and type='*'),true) into email_enabled;
 if exists(select 1 from public.email_unsubscribes where user_id=recipient and type in(input_type,'*')) then email_enabled:=false;end if;
 select * into copy from public.notification_copy(input_type);
 if in_app_enabled then insert into public.notifications(user_id,couple_id,actor_user_id,type,title,title_key,body,action_url,metadata,payload) values(recipient,target_couple,actor,input_type,copy.title,input_type,copy.body,case when copy.action_prefix in('/memories/') and source_id is not null then copy.action_prefix||source_id else copy.action_prefix end,coalesce(event_metadata,'{}'),coalesce(event_metadata,'{}')) returning id into notification_id;insert into public.notification_delivery_logs(notification_id,user_id,channel,provider,status,sent_at) values(notification_id,recipient,'in_app','supabase','sent',now());end if;
 if email_enabled then insert into public.notification_delivery_logs(notification_id,user_id,channel,provider,status,error_message) values(notification_id,recipient,'email','mock','skipped','No production email provider configured');end if;
 insert into public.notification_delivery_logs(notification_id,user_id,channel,provider,status,error_message) values(notification_id,recipient,'push','none','skipped','Push provider not configured');
 return notification_id;
end $$;

create or replace function public.dispatch_notification_event(input_type text,target_couple uuid default null,source_type text default null,source_id text default null,event_metadata jsonb default '{}',confirmation boolean default false) returns integer language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid();recipient uuid;sent integer:=0;
begin if actor is null then raise exception 'Authentication required';end if;if input_type<>all(array['welcome','account_created','couple_created','partner_invited','invitation_accepted_by_partner','invitation_accepted_by_me','partner_joined','memory_added','memory_commented','memory_reacted','media_uploaded','letter_created','letter_unlocked','milestone_created','milestone_reminder','anniversary_reminder','bucket_item_added','bucket_item_completed','daily_question_available','daily_question_answered_by_partner','daily_question_both_answered','profile_updated','password_changed','subscription_started','subscription_cancelled','payment_failed']) then raise exception 'Unsupported notification type';end if;if target_couple is not null and not public.is_couple_member(target_couple) then raise exception 'Couple access required';end if;
 if confirmation or target_couple is null then perform public.emit_notification(actor,actor,target_couple,input_type,source_type,source_id,event_metadata);return 1;end if;
 for recipient in select user_id from public.couple_members where couple_id=target_couple and status='active' and user_id<>actor loop perform public.emit_notification(recipient,actor,target_couple,input_type,source_type,source_id,event_metadata);sent:=sent+1;end loop;return sent;end $$;

create or replace function public.notify_profile_created() returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.emit_notification(new.id,new.id,null,'welcome','profile',new.id::text,'{}');return new;end $$;
drop trigger if exists notification_profile_created on public.profiles;create trigger notification_profile_created after insert on public.profiles for each row execute function public.notify_profile_created();
do $$ declare profile_row record;begin for profile_row in select id from public.profiles loop perform public.emit_notification(profile_row.id,profile_row.id,null,'welcome','profile',profile_row.id::text,'{}');end loop;end $$;
create or replace function public.notify_couple_member_added() returns trigger language plpgsql security definer set search_path=public as $$ declare owner_id uuid;begin if new.role='owner' then perform public.emit_notification(new.user_id,new.user_id,new.couple_id,'couple_created','couple',new.couple_id::text,'{}');else select user_id into owner_id from public.couple_members where couple_id=new.couple_id and role='owner' limit 1;perform public.emit_notification(new.user_id,new.user_id,new.couple_id,'invitation_accepted_by_me','couple',new.couple_id::text,'{}');perform public.emit_notification(owner_id,new.user_id,new.couple_id,'partner_joined','couple',new.couple_id::text,'{}');end if;return new;end $$;
drop trigger if exists notification_couple_member_added on public.couple_members;create trigger notification_couple_member_added after insert on public.couple_members for each row execute function public.notify_couple_member_added();

create or replace function public.process_due_letter_unlock_notifications() returns integer language plpgsql security definer set search_path=public as $$ declare row record;processed integer:=0;begin for row in select id,couple_id,author_id,recipient_id from public.letters where unlock_at<=now() and recipient_id is not null loop if public.emit_notification(row.recipient_id,row.author_id,row.couple_id,'letter_unlocked','letter',row.id::text,'{}') is not null then processed:=processed+1;end if;end loop;return processed;end $$;
create or replace function public.process_upcoming_milestone_reminders() returns integer language sql security definer set search_path=public as $$ select 0 $$;
create or replace function public.process_daily_question_notifications() returns integer language sql security definer set search_path=public as $$ select 0 $$;

revoke all on function public.dispatch_notification_event(text,uuid,text,text,jsonb,boolean) from public;grant execute on function public.dispatch_notification_event(text,uuid,text,text,jsonb,boolean) to authenticated;
do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then alter publication supabase_realtime add table public.notifications;end if;end $$;
