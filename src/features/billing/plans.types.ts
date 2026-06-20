export type PlanLimitKey = "memories" | "mediaItems" | "videos" | "storageMb" | "letters" | "futureLetters" | "milestones" | "bucketListItems" | "albums" | "coupleMembers" | "maxUploadMb";
export type PlanFeatureKey = "videoUpload" | "premiumThemes" | "exportData" | "prioritySupport" | "advancedNotifications" | "storeOriginalImages" | "voiceNotes" | "relationshipYearbook";
export type PlanLimits = Record<PlanLimitKey, number | null>;
export type PlanFeatures = Record<PlanFeatureKey, boolean>;
export interface RegionalPlanPrice { currency: string; monthly: number | null; yearly: number | null; lifetime: number | null }
export interface DynamicPlan {
  id: string; slug: string; name: string; description: string; currency: string;
  monthlyPrice: number | null; yearlyPrice: number | null; lifetimePrice: number | null;
  monthlyPriceLabel: string | null; yearlyPriceLabel: string | null; lifetimePriceLabel: string | null;
  isFree: boolean; isActive: boolean; isPublic: boolean; isFeatured: boolean; trialDays: number;
  badgeText: string | null; ctaText: string | null; displayOrder: number;
  limits: PlanLimits; features: PlanFeatures; marketingFeatures: string[];
  regionalPrices: Record<string, RegionalPlanPrice>; createdAt?: string; updatedAt?: string;
}

export interface EffectivePlanResult { plan: DynamicPlan; limits: PlanLimits; features: PlanFeatures; usage: Partial<Record<PlanLimitKey, number>> }
