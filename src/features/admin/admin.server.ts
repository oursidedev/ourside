/**
 * Server-only admin boundary.
 *
 * Admin authorization is verified from the authenticated Supabase user on every
 * page and endpoint. Hiding navigation is never treated as authorization.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapPlan } from "@/features/billing/plans.mapper";

export type AdminIdentity={id:string;email:string;role:"owner"|"admin"|"support"|"readonly"};
export async function getAdminIdentity():Promise<AdminIdentity|null>{const db=await createServerSupabaseClient();if(!db)return null;const {data:{user}}=await db.auth.getUser();if(!user?.email)return null;const fallback=(process.env.ADMIN_EMAILS||"ourside.dev@gmail.com").split(",").map(value=>value.trim().toLowerCase());const {data}=await db.from("admin_users").select("role,is_active").or(`user_id.eq.${user.id},email.ilike.${user.email}`).maybeSingle();if(data?.is_active)return{id:user.id,email:user.email,role:data.role as AdminIdentity["role"]};if(fallback.includes(user.email.toLowerCase()))return{id:user.id,email:user.email,role:"owner"};return null;}
export async function requireAdmin(){const admin=await getAdminIdentity();if(!admin)throw new Error("ADMIN_REQUIRED");return admin;}
export async function writeAudit(action:string,targetType?:string,targetId?:string,metadata:Record<string,unknown>={}){const admin=await requireAdmin();const db=await createServerSupabaseClient();await db?.from("admin_audit_logs").insert({admin_user_id:admin.id,admin_email:admin.email,action,target_type:targetType,target_id:targetId,metadata});}

export async function getAdminOverview(){await requireAdmin();const db=await createServerSupabaseClient();const {data,error}=await db!.rpc("admin_overview");if(error)throw error;return data as Record<string,number|string|null>;}
export async function getAdminPlans(){await requireAdmin();const db=await createServerSupabaseClient();const {data,error}=await db!.from("plans").select("*").order("display_order");if(error)throw error;return(data||[]).map(row=>mapPlan(row as Record<string,unknown>));}
export async function getAdminSection(section:string,search=""){await requireAdmin();const db=await createServerSupabaseClient();if(!db)return[];
 if(section==="users"){const {data,error}=await db.rpc("admin_list_users",{search_text:search,row_limit:100});if(error)throw error;return data||[];}
 if(section==="couples"){const {data,error}=await db.rpc("admin_list_couples",{row_limit:100});if(error)throw error;return data||[];}
 if(section==="invites"){const {data,error}=await db.rpc("admin_list_invites",{row_limit:100});if(error)throw error;return data||[];}
 const config:Record<string,{table:string;columns:string;order:string}>={errors:{table:"app_errors",columns:"id,level,message,source,path,status,occurrence_count,first_seen_at,last_seen_at",order:"last_seen_at"},notifications:{table:"notification_logs",columns:"id,user_id,channel,provider,status,error_summary,sent_at,created_at",order:"created_at"},"audit-logs":{table:"admin_audit_logs",columns:"id,admin_email,action,target_type,target_id,metadata,created_at",order:"created_at"},analytics:{table:"analytics_page_views",columns:"id,domain,path,created_at",order:"created_at"}};
 const item=config[section];if(!item)return[];const {data,error}=await db.from(item.table).select(item.columns).order(item.order,{ascending:false}).limit(100);if(error)throw error;return data||[];
}
export function getSystemHealth(){const names=["NEXT_PUBLIC_MARKETING_URL","NEXT_PUBLIC_APP_URL","NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","EMAIL_PROVIDER","RESEND_API_KEY","ADMIN_EMAILS","NEXT_PUBLIC_ANALYTICS_ENABLED","ANALYTICS_LIVE_WINDOW_SECONDS","BILLING_PROVIDER"] as const;return names.map(name=>({name,status:process.env[name]?"configured":"missing"}));}
