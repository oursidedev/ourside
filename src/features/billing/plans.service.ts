/**
 * Central dynamic plan service.
 *
 * Public pricing, app billing and database enforcement read the same plan rows.
 * The local fallback only protects availability before migrations/config exist.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FALLBACK_PUBLIC_PLANS } from "./plans.defaults";
import { mapPlan } from "./plans.mapper";
import type { DynamicPlan, PlanFeatureKey } from "./plans.types";

const PLAN_COLUMNS="id,slug,name,description,currency,price_monthly,price_yearly,lifetime_price,monthly_price_label,yearly_price_label,lifetime_price_label,is_free,is_active,is_public,is_featured,trial_days,badge_text,cta_text,display_order,limits,features,marketing_features,regional_prices,created_at,updated_at";
export async function getPublicPlans():Promise<DynamicPlan[]>{const db=await createServerSupabaseClient();if(!db)return FALLBACK_PUBLIC_PLANS;const {data,error}=await db.from("plans").select(PLAN_COLUMNS).eq("is_active",true).eq("is_public",true).order("display_order");return error||!data?.length?FALLBACK_PUBLIC_PLANS:data.map(row=>mapPlan(row as Record<string,unknown>));}
export async function getPlanBySlug(slug:string){const db=await createServerSupabaseClient();if(!db)return FALLBACK_PUBLIC_PLANS.find(plan=>plan.slug===slug)||null;const {data,error}=await db.from("plans").select(PLAN_COLUMNS).eq("slug",slug).eq("is_active",true).maybeSingle();if(error||!data)return FALLBACK_PUBLIC_PLANS.find(plan=>plan.slug===slug)||null;return mapPlan(data as Record<string,unknown>);}
export function canUsePlanFeature(plan:DynamicPlan,key:PlanFeatureKey){return Boolean(plan.features[key]);}
