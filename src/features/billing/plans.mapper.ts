import { DEFAULT_FEATURES, DEFAULT_LIMITS } from "./plans.defaults";
import type { DynamicPlan } from "./plans.types";

export function mapPlan(row: Record<string, unknown>): DynamicPlan {
  return {
    id:String(row.id),slug:String(row.slug),name:String(row.name),description:String(row.description||""),currency:String(row.currency||"USD"),
    monthlyPrice:row.price_monthly==null?null:Number(row.price_monthly),yearlyPrice:row.price_yearly==null?null:Number(row.price_yearly),lifetimePrice:row.lifetime_price==null?null:Number(row.lifetime_price),
    monthlyPriceLabel:row.monthly_price_label?String(row.monthly_price_label):null,yearlyPriceLabel:row.yearly_price_label?String(row.yearly_price_label):null,lifetimePriceLabel:row.lifetime_price_label?String(row.lifetime_price_label):null,
    isFree:Boolean(row.is_free),isActive:Boolean(row.is_active),isPublic:Boolean(row.is_public),isFeatured:Boolean(row.is_featured),trialDays:Number(row.trial_days||0),badgeText:row.badge_text?String(row.badge_text):null,ctaText:row.cta_text?String(row.cta_text):null,displayOrder:Number(row.display_order||0),
    limits:{...DEFAULT_LIMITS,...(row.limits as object||{})},features:{...DEFAULT_FEATURES,...(row.features as object||{})},marketingFeatures:Array.isArray(row.marketing_features)?row.marketing_features.map(String):[],regionalPrices:(row.regional_prices as DynamicPlan["regionalPrices"])||{},createdAt:row.created_at?String(row.created_at):undefined,updatedAt:row.updated_at?String(row.updated_at):undefined,
  };
}

export function publicPlan(plan: DynamicPlan) {
  const { id: _id, createdAt: _created, updatedAt: _updated, ...safe } = plan;
  void _id; void _created; void _updated;
  return safe;
}
