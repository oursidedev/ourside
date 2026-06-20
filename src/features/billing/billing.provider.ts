/**
 * Provider-agnostic billing boundary. UI code must never call payment SDKs directly.
 * Verified provider webhooks—not redirects or success pages—are responsible for changing subscription state.
 */
import type { BillingProvider, BillingWebhookResult, CheckoutSession, CustomerPortalSession } from "./billing.types";
import type { CreateCheckoutInput, CreatePortalInput } from "./billing.schema";
export interface BillingProviderAdapter { readonly provider: BillingProvider; createCheckoutSession(input: CreateCheckoutInput & { userId: string; coupleId?: string | null }): Promise<CheckoutSession>; createCustomerPortalSession(input: CreatePortalInput & { userId: string }): Promise<CustomerPortalSession>; handleWebhook(payload: unknown, signature?: string): Promise<BillingWebhookResult>; cancelSubscription(subscriptionId: string): Promise<void>; }
