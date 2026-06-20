-- Allow both members to see shared content changes without refreshing. RLS still filters rows.
do $$
declare table_name text;
begin
  foreach table_name in array array['memories','milestones','bucket_list_items','letters'] loop
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=table_name) then
      execute format('alter publication supabase_realtime add table public.%I',table_name);
    end if;
  end loop;
end $$;

-- Shared memories may be updated by either active member; inserts still identify their author.
drop policy if exists "members manage memories" on public.memories;
create policy "members read memories" on public.memories for select using(public.is_couple_member(couple_id));
create policy "members create memories" on public.memories for insert with check(public.is_couple_member(couple_id) and author_id=auth.uid());
create policy "members update memories" on public.memories for update using(public.is_couple_member(couple_id)) with check(public.is_couple_member(couple_id));
create policy "members delete memories" on public.memories for delete using(public.is_couple_member(couple_id));
