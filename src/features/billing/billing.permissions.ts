/** Premium checks derive from verified subscription state. Frontend checks improve UX but are never an authorization boundary. */
import { BILLING_PLAN_LIMITS, PLAN_FEATURES } from "./billing.constants";
import type { PlanSlug, PremiumFeature, Subscription } from "./billing.types";
export function effectivePlan(subscription: Subscription | null | undefined, now = new Date()): PlanSlug { if (!subscription || !["active","trialing"].includes(subscription.status)) return "free"; if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) <= now && subscription.planSlug !== "lifetime") return "free"; return subscription.planSlug; }
export function canUseFeature(subscription: Subscription | null | undefined, feature: PremiumFeature) { return PLAN_FEATURES[effectivePlan(subscription)].includes(feature); }
export function getPlanLimit<K extends keyof typeof BILLING_PLAN_LIMITS.free>(subscription: Subscription | null | undefined, limit: K) { return BILLING_PLAN_LIMITS[effectivePlan(subscription)][limit]; }
export function canUseFeatureForPlan(plan: PlanSlug, feature: PremiumFeature) { return PLAN_FEATURES[plan].includes(feature); }
