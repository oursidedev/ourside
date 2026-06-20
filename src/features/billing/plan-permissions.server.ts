/** Server-side permission helpers. Frontend plan labels are never authorization. */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPlanBySlug } from "./plans.service";
import type { EffectivePlanResult, PlanFeatureKey, PlanLimitKey } from "./plans.types";

export async function getUserEffectivePlan(userId:string):Promise<EffectivePlanResult|null>{const db=await createServerSupabaseClient();if(!db)return null;const {data:membership}=await db.from("couple_members").select("couple_id").eq("user_id",userId).maybeSingle();const coupleId=membership?.couple_id;let slug="free";if(coupleId){const {data}=await db.rpc("effective_couple_plan",{target_couple:coupleId});if(data)slug=String(data);}const plan=await getPlanBySlug(slug);if(!plan)return null;const usage:EffectivePlanResult["usage"]={};if(coupleId){const tables:{key:PlanLimitKey;table:string}[]=[{key:"memories",table:"memories"},{key:"mediaItems",table:"memory_media"},{key:"futureLetters",table:"letters"},{key:"milestones",table:"milestones"},{key:"bucketListItems",table:"bucket_list_items"},{key:"albums",table:"albums"}];await Promise.all(tables.map(async item=>{const {count}=await db.from(item.table).select("id",{head:true,count:"exact"}).eq("couple_id",coupleId);usage[item.key]=count||0;}));}return{plan,limits:plan.limits,features:plan.features,usage};}
export async function canUseFeature(userId:string,key:PlanFeatureKey){const result=await getUserEffectivePlan(userId);return Boolean(result?.features[key]);}
export async function canCreateWithinLimit(userId:string,key:PlanLimitKey){const result=await getUserEffectivePlan(userId);if(!result)return{allowed:false,used:0,limit:0};const limit=result.limits[key];const used=result.usage[key]||0;return{allowed:limit==null||used<limit,used,limit,plan:result.plan};}
export const canCreateMemory=(userId:string)=>canCreateWithinLimit(userId,"memories");
export const canCreateLetter=(userId:string)=>canCreateWithinLimit(userId,"letters");
export const canCreateFutureLetter=(userId:string)=>canCreateWithinLimit(userId,"futureLetters");
