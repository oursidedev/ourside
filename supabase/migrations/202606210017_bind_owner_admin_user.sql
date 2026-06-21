-- The owner account was created after the initial admin migration. Bind the
-- email-based bootstrap record to its auth user so authorization no longer
-- depends only on the JWT email fallback.
update public.admin_users as admin
set user_id = auth_user.id
from auth.users as auth_user
where admin.user_id is null
  and lower(admin.email) = lower(auth_user.email);
