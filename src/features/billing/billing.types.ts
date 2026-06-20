import type { IsoDateTime } from "@/types/core";

export type PlanSlug = "free" | "plus" | "lifetime";
export type BillingInterval = "monthly" | "yearly" | "lifetime";
export type BillingProvider = "mock" | "iyzico" | "paddle" | "lemon_squeezy" | "stripe" | "apple" | "google";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PremiumFeature = "video_upload" | "unlimited_letters" | "unlimited_albums" | "premium_themes" | "relationship_yearbook" | "store_original_images" | "voice_notes" | "full_export";

export interface Plan { id: string; slug: PlanSlug; name: string; description: string; priceMonthly: number | null; priceYearly: number | null; currency: string; features: PremiumFeature[]; active: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime; }
export interface Subscription { id: string; userId: string; coupleId: string | null; planId: string; planSlug: PlanSlug; provider: BillingProvider; providerCustomerId: string | null; providerSubscriptionId: string | null; status: SubscriptionStatus; currentPeriodStart: IsoDateTime | null; currentPeriodEnd: IsoDateTime | null; cancelAtPeriodEnd: boolean; createdAt: IsoDateTime; updatedAt: IsoDateTime; }
export interface Payment { id: string; userId: string; coupleId: string | null; provider: BillingProvider; providerPaymentId: string | null; amount: number; currency: string; status: PaymentStatus; paidAt: IsoDateTime | null; createdAt: IsoDateTime; }
export interface BillingEvent { id: string; provider: BillingProvider; eventType: string; eventId: string; payload: unknown; processedAt: IsoDateTime | null; createdAt: IsoDateTime; }
export interface CheckoutSession { id: string; provider: BillingProvider; url: string; expiresAt: IsoDateTime; }
export interface CustomerPortalSession { url: string; expiresAt: IsoDateTime; }
export interface BillingWebhookResult { eventId: string; processed: boolean; duplicate: boolean; }
