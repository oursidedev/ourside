-- Server-authoritative plan lookup and quota enforcement. Client plan state is never trusted.
create or replace function public.effective_couple_plan(target_couple uuid)
returns text language sql stable security definer set search_path=public as $$
  select coalesce((
    select p.slug from public.subscriptions s join public.plans p on p.id=s.plan_id
    where (s.couple_id=target_couple or (s.couple_id is null and exists(select 1 from public.couple_members cm where cm.couple_id=target_couple and cm.user_id=s.user_id and cm.status='active')))
      and s.status in ('active','trialing') and (p.slug='lifetime' or s.current_period_end is null or s.current_period_end>now())
    order by case p.slug when 'lifetime' then 2 when 'plus' then 1 else 0 end desc,s.updated_at desc limit 1
  ),'free');
$$;

create or replace function public.enforce_media_plan_limits()
returns trigger language plpgsql security definer set search_path=public as $$
declare target_couple uuid; plan_slug text; image_count integer;
begin
  select couple_id into target_couple from public.memories where id=new.memory_id;
  if target_couple is null then raise exception 'Memory not found'; end if;
  plan_slug:=public.effective_couple_plan(target_couple);
  if plan_slug='free' then
    if new.type in ('video','audio') then raise exception 'This media type requires Ourside Plus'; end if;
    if coalesce(new.file_size,0)>10485760 then raise exception 'Free uploads are limited to 10 MB before compression'; end if;
    if new.storage_path_original is not null then raise exception 'Original storage requires Ourside Plus'; end if;
    select count(*) into image_count from public.memory_media mm join public.memories m on m.id=mm.memory_id where m.couple_id=target_couple and mm.type='image';
    if image_count>=50 then raise exception 'Free plan photo limit reached'; end if;
  end if;
  return new;
end; $$;
drop trigger if exists enforce_media_plan on public.memory_media;
create trigger enforce_media_plan before insert or update of type,file_size,storage_path_original,memory_id on public.memory_media for each row execute function public.enforce_media_plan_limits();

create or replace function public.enforce_album_plan_limit()
returns trigger language plpgsql security definer set search_path=public as $$
begin if public.effective_couple_plan(new.couple_id)='free' and (select count(*) from public.albums where couple_id=new.couple_id)>=3 then raise exception 'Free plan album limit reached'; end if; return new; end; $$;
drop trigger if exists enforce_album_plan on public.albums;
create trigger enforce_album_plan before insert on public.albums for each row execute function public.enforce_album_plan_limit();

create or replace function public.enforce_letter_plan_limit()
returns trigger language plpgsql security definer set search_path=public as $$
begin if public.effective_couple_plan(new.couple_id)='free' and (select count(*) from public.letters where couple_id=new.couple_id and status<>'archived')>=3 then raise exception 'Free plan future letter limit reached'; end if; return new; end; $$;
drop trigger if exists enforce_letter_plan on public.letters;
create trigger enforce_letter_plan before insert on public.letters for each row execute function public.enforce_letter_plan_limit();

drop policy if exists "authors upload private couple media" on storage.objects;
create policy "authors upload private couple media" on storage.objects for insert to authenticated
with check(bucket_id='couple-media' and public.can_write_storage_memory(name)
  and (name !~* '/original\.[a-z0-9]+$' or public.effective_couple_plan(public.storage_object_couple_id(name)) in ('plus','lifetime'))
  and name ~* '^couples/[0-9a-f-]{36}/memories/[0-9a-f-]{36}/[0-9a-f-]{36}/(thumbnail|medium|large|original)\.[a-z0-9]+$');

drop policy if exists "members insert own media" on public.memory_media;
create policy "members insert entitled media" on public.memory_media for insert to authenticated
with check(public.is_couple_member(couple_id) and uploaded_by=auth.uid()
  and (type='image' or public.effective_couple_plan(couple_id) in ('plus','lifetime')));

revoke all on function public.effective_couple_plan(uuid) from public;
grant execute on function public.effective_couple_plan(uuid) to authenticated;
