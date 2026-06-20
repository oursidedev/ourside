-- Adds short human-readable codes while retaining UUID token links.
alter table public.partner_invites add column if not exists invite_code text;
alter table public.partner_invites add column if not exists status text not null default 'pending' check(status in ('pending','accepted','revoked'));

create or replace function public.generate_partner_invite_code()
returns text language plpgsql volatile set search_path=public as $$
declare alphabet text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; generated text; i integer;
begin
  loop
    generated:='OURS-';
    for i in 1..4 loop generated:=generated||substr(alphabet,1+floor(random()*length(alphabet))::integer,1); end loop;
    exit when not exists(select 1 from public.partner_invites where invite_code=generated);
  end loop;
  return generated;
end; $$;

alter table public.partner_invites alter column invite_code set default public.generate_partner_invite_code();

update public.partner_invites set invite_code=public.generate_partner_invite_code() where invite_code is null;
update public.partner_invites set status=case when accepted_at is not null then 'accepted' when revoked_at is not null then 'revoked' else 'pending' end;
alter table public.partner_invites alter column invite_code set not null;
create unique index if not exists partner_invites_code_idx on public.partner_invites(invite_code);

create or replace function public.create_partner_invitation()
returns table(invitation_id uuid,invite_token uuid,invite_code text,expires_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare target_couple uuid; created public.partner_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select couple_id into target_couple from public.couple_members where user_id=auth.uid() and status='active' limit 1;
  if target_couple is null then raise exception 'Create your Ourside before inviting a partner'; end if;
  perform 1 from public.couples where id=target_couple for update;
  if (select count(*) from public.couple_members where couple_id=target_couple and status='active')>=2 then raise exception 'Your Ourside already has two members'; end if;
  update public.partner_invites set revoked_at=coalesce(revoked_at,now()),status='revoked' where couple_id=target_couple and accepted_at is null and revoked_at is null;
  insert into public.partner_invites(couple_id,created_by,invite_code,status) values(target_couple,auth.uid(),public.generate_partner_invite_code(),'pending') returning * into created;
  return query select created.id,created.token,created.invite_code,created.expires_at;
end; $$;

create or replace function public.get_active_partner_invitation()
returns table(invitation_id uuid,invite_token uuid,invite_code text,expires_at timestamptz)
language sql stable security definer set search_path=public as $$
 select i.id,i.token,i.invite_code,i.expires_at from public.partner_invites i join public.couple_members cm on cm.couple_id=i.couple_id
 where cm.user_id=auth.uid() and cm.status='active' and i.status='pending' and i.accepted_at is null and i.revoked_at is null and i.expires_at>now()
 order by i.created_at desc limit 1;
$$;

create or replace function public.get_partner_invite_preview_by_code(input_code text)
returns table(couple_name text,inviter_name text,member_count bigint,expires_at timestamptz,is_valid boolean)
language sql stable security definer set search_path=public as $$
 select c.name,p.display_name,(select count(*) from public.couple_members cm where cm.couple_id=c.id and cm.status='active'),i.expires_at,
 i.status='pending' and i.revoked_at is null and i.accepted_at is null and i.expires_at>now() and (select count(*) from public.couple_members cm where cm.couple_id=c.id and cm.status='active')<2
 from public.partner_invites i join public.couples c on c.id=i.couple_id join public.profiles p on p.id=i.created_by
 where regexp_replace(upper(i.invite_code),'[^A-Z0-9]','','g')=regexp_replace(upper(trim(input_code)),'[^A-Z0-9]','','g') limit 1;
$$;

create or replace function public.accept_partner_invite_by_code(input_code text)
returns uuid language plpgsql security definer set search_path=public as $$
declare resolved_token uuid;
begin
 select token into resolved_token from public.partner_invites where regexp_replace(upper(invite_code),'[^A-Z0-9]','','g')=regexp_replace(upper(trim(input_code)),'[^A-Z0-9]','','g') limit 1;
 if resolved_token is null then raise exception 'Invite code not found'; end if;
 return public.accept_partner_invite(resolved_token);
end; $$;

create or replace function public.revoke_partner_invitation(target_invitation uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 update public.partner_invites i set revoked_at=coalesce(i.revoked_at,now()),status='revoked'
 where i.id=target_invitation and i.accepted_at is null and exists(select 1 from public.couple_members cm where cm.couple_id=i.couple_id and cm.user_id=auth.uid() and cm.status='active');
 if not found then raise exception 'Invitation cannot be revoked'; end if;
end; $$;

-- Keep status synchronized for token-based acceptance.
create or replace function public.sync_partner_invite_status()
returns trigger language plpgsql set search_path=public as $$
begin if new.accepted_at is not null then new.status:='accepted'; elsif new.revoked_at is not null then new.status:='revoked'; else new.status:='pending'; end if; return new; end; $$;
drop trigger if exists sync_partner_invite_status_trigger on public.partner_invites;
create trigger sync_partner_invite_status_trigger before insert or update of accepted_at,revoked_at on public.partner_invites for each row execute function public.sync_partner_invite_status();

revoke all on function public.create_partner_invitation() from public;
revoke all on function public.get_active_partner_invitation() from public;
revoke all on function public.get_partner_invite_preview_by_code(text) from public;
revoke all on function public.accept_partner_invite_by_code(text) from public;
revoke all on function public.revoke_partner_invitation(uuid) from public;
grant execute on function public.create_partner_invitation() to authenticated;
grant execute on function public.get_active_partner_invitation() to authenticated;
grant execute on function public.get_partner_invite_preview_by_code(text) to anon,authenticated;
grant execute on function public.accept_partner_invite_by_code(text) to authenticated;
grant execute on function public.revoke_partner_invitation(uuid) to authenticated;
