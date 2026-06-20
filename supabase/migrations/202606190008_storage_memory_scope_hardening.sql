-- Bind each object path to a real memory row; couple membership alone is not enough for private-memory media.
create or replace function public.storage_object_memory_id(object_name text)
returns uuid language plpgsql immutable set search_path=public as $$
declare candidate text;
begin
  if split_part(object_name,'/',3) <> 'memories' then return null; end if;
  candidate:=split_part(object_name,'/',4);
  if candidate !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then return null; end if;
  return candidate::uuid;
end; $$;

create or replace function public.can_read_storage_memory(object_name text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.memories m
    where m.id=public.storage_object_memory_id(object_name)
      and m.couple_id=public.storage_object_couple_id(object_name)
      and public.is_couple_member(m.couple_id)
      and (m.visibility='couple' or m.author_id=auth.uid())
  );
$$;

create or replace function public.can_write_storage_memory(object_name text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.memories m
    where m.id=public.storage_object_memory_id(object_name)
      and m.couple_id=public.storage_object_couple_id(object_name)
      and public.is_couple_member(m.couple_id)
      and m.author_id=auth.uid()
  );
$$;

drop policy if exists "members read private couple media" on storage.objects;
drop policy if exists "members upload private couple media" on storage.objects;
drop policy if exists "members update private couple media" on storage.objects;
drop policy if exists "members delete private couple media" on storage.objects;
create policy "members read private couple media" on storage.objects for select to authenticated
using(bucket_id='couple-media' and public.can_read_storage_memory(name));
create policy "authors upload private couple media" on storage.objects for insert to authenticated
with check(bucket_id='couple-media' and public.can_write_storage_memory(name) and name ~* '^couples/[0-9a-f-]{36}/memories/[0-9a-f-]{36}/[0-9a-f-]{36}/(thumbnail|medium|large|original)\.[a-z0-9]+$');
create policy "authors update private couple media" on storage.objects for update to authenticated
using(bucket_id='couple-media' and public.can_write_storage_memory(name)) with check(bucket_id='couple-media' and public.can_write_storage_memory(name));
create policy "authors delete private couple media" on storage.objects for delete to authenticated
using(bucket_id='couple-media' and public.can_write_storage_memory(name));

revoke all on function public.can_read_storage_memory(text) from public;
revoke all on function public.can_write_storage_memory(text) from public;
grant execute on function public.can_read_storage_memory(text) to authenticated;
grant execute on function public.can_write_storage_memory(text) to authenticated;
