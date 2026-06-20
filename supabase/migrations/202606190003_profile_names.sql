alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

alter table public.profiles
  add constraint profiles_first_name_length check (first_name is null or char_length(first_name) between 1 and 80),
  add constraint profiles_last_name_length check (last_name is null or char_length(last_name) between 1 and 80);

update public.profiles
set
  first_name = coalesce(first_name, nullif(split_part(trim(display_name), ' ', 1), '')),
  last_name = coalesce(last_name, nullif(trim(substr(trim(display_name), length(split_part(trim(display_name), ' ', 1)) + 1)), ''));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_first_name text;
  resolved_last_name text;
  resolved_display_name text;
  provider_full_name text;
begin
  provider_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', '')
  );

  resolved_first_name := coalesce(
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'given_name', ''),
    nullif(split_part(provider_full_name, ' ', 1), ''),
    split_part(new.email, '@', 1)
  );

  resolved_last_name := coalesce(
    nullif(new.raw_user_meta_data->>'last_name', ''),
    nullif(new.raw_user_meta_data->>'family_name', ''),
    nullif(trim(substr(provider_full_name, length(split_part(provider_full_name, ' ', 1)) + 1)), '')
  );

  resolved_display_name := coalesce(
    nullif(trim(concat_ws(' ', resolved_first_name, resolved_last_name)), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles(id, display_name, first_name, last_name, avatar_url)
  values(
    new.id,
    resolved_display_name,
    resolved_first_name,
    resolved_last_name,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;
