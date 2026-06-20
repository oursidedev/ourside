-- Small operational actions kept server-authoritative and audited.
create or replace function public.admin_send_test_notification() returns uuid
language plpgsql security definer set search_path=public as $$
declare result uuid; actor_email text:=auth.jwt()->>'email';
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 result:=public.emit_notification(auth.uid(),auth.uid(),null,'welcome','admin_test',null,jsonb_build_object('test',true));
 insert into public.admin_audit_logs(admin_user_id,admin_email,action,target_type,target_id) values(auth.uid(),actor_email,'send_test_notification','user',auth.uid()::text);
 return result;
end $$;
revoke all on function public.admin_send_test_notification() from public;
grant execute on function public.admin_send_test_notification() to authenticated;

create or replace function public.admin_storage_summary() returns jsonb
language plpgsql stable security definer set search_path=public as $$
begin if not public.is_admin() then raise exception 'Admin access required'; end if;
 return jsonb_build_object('totalFiles',(select count(*) from public.memory_media),'totalBytes',(select coalesce(sum(file_size),0) from public.memory_media),'images',(select count(*) from public.memory_media where type='image'),'videos',(select count(*) from public.memory_media where type='video'),'failedUploads',0);
end $$;
revoke all on function public.admin_storage_summary() from public;
grant execute on function public.admin_storage_summary() to authenticated;
