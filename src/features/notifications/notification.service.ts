import { createClient } from "@/lib/supabase/client";
import type { AppNotification,NotificationChannel,NotificationPreference } from "./notification.types";
type Row={id:string;user_id:string;couple_id:string|null;actor_user_id:string|null;type:AppNotification["type"];title:string|null;body:string|null;action_url:string|null;metadata:Record<string,unknown>|null;read_at:string|null;archived_at:string|null;created_at:string|null};

// Legacy rows must never be able to crash the complete app shell.
const safeIsoDate=(value:string|null)=>{
 const parsed=value?new Date(value):null;
 return parsed&&Number.isFinite(parsed.getTime())?parsed.toISOString():new Date().toISOString();
};
const map=(row:Row):AppNotification=>({id:row.id,userId:row.user_id,coupleId:row.couple_id,actorUserId:row.actor_user_id,type:row.type,title:row.title||"Ourside",body:row.body||"",actionUrl:row.action_url,metadata:row.metadata||{},readAt:row.read_at,archivedAt:row.archived_at,createdAt:safeIsoDate(row.created_at)});
export const notificationService={
 async list(limit=30):Promise<AppNotification[]>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{data,error}=await client.from("notifications").select("id,user_id,couple_id,actor_user_id,type,title,body,action_url,metadata,read_at,archived_at,created_at").is("archived_at",null).order("created_at",{ascending:false}).limit(Math.min(limit,50));if(error)throw error;return(data||[]).map(row=>map(row as Row));},
 async unreadCount(){const client=createClient();if(!client)return 0;const{count}=await client.from("notifications").select("id",{count:"exact",head:true}).is("read_at",null).is("archived_at",null);return count||0;},
 async markRead(id:string){const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{error}=await client.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id);if(error)throw error;},
 async markAllRead(){const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{data:user}=await client.auth.getUser();if(!user.user)throw new Error("Authentication required.");const{error}=await client.from("notifications").update({read_at:new Date().toISOString()}).eq("user_id",user.user.id).is("read_at",null);if(error)throw error;},
 async archive(id:string){const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{error}=await client.from("notifications").update({archived_at:new Date().toISOString()}).eq("id",id);if(error)throw error;},
 async preferences():Promise<NotificationPreference[]>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{data,error}=await client.from("notification_preferences").select("channel,type,enabled");if(error)throw error;return(data||[]) as NotificationPreference[];},
 async setPreference(channel:NotificationChannel,type:string,enabled:boolean){const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{data:user}=await client.auth.getUser();if(!user.user)throw new Error("Authentication required.");const{error}=await client.from("notification_preferences").upsert({user_id:user.user.id,channel,type,enabled,updated_at:new Date().toISOString()},{onConflict:"user_id,channel,type"});if(error)throw error;}
};
