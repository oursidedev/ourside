-- Private media hardening and query indexes. Billing-specific quotas remain for Part 3.
update storage.buckets set public=false, file_size_limit=26214400,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/quicktime','video/webm','audio/mpeg','audio/mp4']
where id='couple-media';

create or replace function public.storage_object_couple_id(object_name text)
returns uuid language plpgsql immutable set search_path=public as $$
declare candidate text;
begin
  if split_part(object_name,'/',1) <> 'couples' then return null; end if;
  candidate:=split_part(object_name,'/',2);
  if candidate !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then return null; end if;
  return candidate::uuid;
end; $$;

drop policy if exists "members read couple media" on storage.objects;
drop policy if exists "members upload couple media" on storage.objects;
drop policy if exists "members update couple media" on storage.objects;
drop policy if exists "members delete couple media" on storage.objects;
create policy "members read private couple media" on storage.objects for select to authenticated
using(bucket_id='couple-media' and public.is_couple_member(public.storage_object_couple_id(name)));
create policy "members upload private couple media" on storage.objects for insert to authenticated
with check(bucket_id='couple-media' and public.is_couple_member(public.storage_object_couple_id(name)) and name ~* '^couples/[0-9a-f-]{36}/memories/[0-9a-f-]{36}/[0-9a-f-]{36}/(thumbnail|medium|large|original)\.[a-z0-9]+$');
create policy "members update private couple media" on storage.objects for update to authenticated
using(bucket_id='couple-media' and public.is_couple_member(public.storage_object_couple_id(name)))
with check(bucket_id='couple-media' and public.is_couple_member(public.storage_object_couple_id(name)));
create policy "members delete private couple media" on storage.objects for delete to authenticated
using(bucket_id='couple-media' and public.is_couple_member(public.storage_object_couple_id(name)));

-- Child rows copy couple_id for fast RLS/indexing, but this trigger prevents clients from forging it.
create or replace function public.sync_memory_child_couple()
returns trigger language plpgsql security definer set search_path=public as $$
declare expected_couple uuid; expected_author uuid;
begin
  select couple_id,author_id into expected_couple,expected_author from public.memories where id=new.memory_id;
  if expected_couple is null then raise exception 'Memory not found'; end if;
  if new.couple_id is not null and new.couple_id <> expected_couple then raise exception 'Media couple mismatch'; end if;
  new.couple_id:=expected_couple;
  if tg_table_name='memory_media' and new.uploaded_by is null then new.uploaded_by:=coalesce(auth.uid(),expected_author); end if;
  return new;
end; $$;

drop trigger if exists sync_media_couple on public.memory_media;
create trigger sync_media_couple before insert or update of memory_id,couple_id on public.memory_media for each row execute function public.sync_memory_child_couple();
drop trigger if exists sync_comment_couple on public.memory_comments;
create trigger sync_comment_couple before insert or update of memory_id,couple_id on public.memory_comments for each row execute function public.sync_memory_child_couple();
drop trigger if exists sync_reaction_couple on public.memory_reactions;
create trigger sync_reaction_couple before insert or update of memory_id,couple_id on public.memory_reactions for each row execute function public.sync_memory_child_couple();

drop policy if exists "members manage media" on public.memory_media;
create policy "members read visible media" on public.memory_media for select to authenticated using(
  public.is_couple_member(couple_id) and exists(select 1 from public.memories m where m.id=memory_id and (m.visibility='couple' or m.author_id=auth.uid()))
);
create policy "members insert own media" on public.memory_media for insert to authenticated with check(public.is_couple_member(couple_id) and uploaded_by=auth.uid());
create policy "uploaders update media" on public.memory_media for update to authenticated using(uploaded_by=auth.uid()) with check(public.is_couple_member(couple_id) and uploaded_by=auth.uid());
create policy "uploaders delete media" on public.memory_media for delete to authenticated using(uploaded_by=auth.uid());

-- Recipient clients list safe metadata through this RPC; encrypted_body is never returned here.
create or replace function public.get_letter_previews(target_couple uuid)
returns table(id uuid,title text,author_id uuid,recipient_id uuid,unlock_at timestamptz,opened_at timestamptz,status text,created_at timestamptz)
language sql stable security definer set search_path=public as $$
  select l.id,l.title,l.author_id,l.recipient_id,l.unlock_at,l.opened_at,l.status,l.created_at
  from public.letters l where l.couple_id=target_couple and public.is_couple_member(target_couple)
  order by l.unlock_at desc,l.id desc limit 100;
$$;
revoke all on function public.get_letter_previews(uuid) from public;
grant execute on function public.get_letter_previews(uuid) to authenticated;

-- Composite indexes match timeline cursors, relation lookups, reminders, and unread feeds.
create index if not exists profiles_auth_lookup_idx on public.profiles(id);
create index if not exists couple_members_user_active_idx on public.couple_members(user_id,status,couple_id);
create index if not exists couple_members_couple_active_idx on public.couple_members(couple_id,status,user_id);
create index if not exists partner_invites_active_idx on public.partner_invites(couple_id,expires_at) where accepted_at is null and revoked_at is null;
create index if not exists memories_couple_created_idx on public.memories(couple_id,created_at desc,id desc);
create index if not exists memories_couple_favorite_idx on public.memories(couple_id,memory_date desc,id desc) where is_favorite=true;
create index if not exists memory_media_couple_memory_idx on public.memory_media(couple_id,memory_id,sort_order);
create index if not exists memory_comments_memory_created_idx on public.memory_comments(memory_id,created_at,id);
create index if not exists memory_reactions_memory_idx on public.memory_reactions(memory_id,created_at);
create index if not exists albums_couple_created_idx on public.albums(couple_id,created_at desc,id desc);
create index if not exists album_memories_album_created_idx on public.album_memories(album_id,created_at desc,memory_id);
create index if not exists album_memories_memory_idx on public.album_memories(memory_id,album_id);
create index if not exists letters_couple_status_unlock_idx on public.letters(couple_id,status,unlock_at,id);
create index if not exists letters_recipient_unlock_idx on public.letters(recipient_id,unlock_at) where opened_at is null;
create index if not exists milestones_couple_date_idx on public.milestones(couple_id,milestone_date desc,id desc);
create index if not exists bucket_items_couple_status_idx on public.bucket_list_items(couple_id,status,created_at desc);
create index if not exists daily_answers_couple_question_idx on public.daily_answers(couple_id,question_id,answer_date,user_id);
create index if not exists notifications_unread_idx on public.notifications(user_id,created_at desc,id desc) where read_at is null;
