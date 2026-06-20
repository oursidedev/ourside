/** Development-only provider. It never activates production entitlements and must not be enabled in a production build. */
import { MOCK_BILLING_ENABLED } from "../billing.constants"; import type { BillingProviderAdapter } from "../billing.provider"; import type { BillingWebhookResult, CheckoutSession, CustomerPortalSession } from "../billing.types";
const processedEvents = new Set<string>();
export class MockBillingProvider implements BillingProviderAdapter { readonly provider="mock" as const;
  private assertEnabled(){if(!MOCK_BILLING_ENABLED)throw new Error("Mock billing is disabled.");}
  async createCheckoutSession(input: Parameters<BillingProviderAdapter["createCheckoutSession"]>[0]):Promise<CheckoutSession>{this.assertEnabled();const id=crypto.randomUUID();const url=new URL(input.successUrl);url.searchParams.set("session_id",id);url.searchParams.set("mock","pending");return{id,provider:this.provider,url:url.toString(),expiresAt:new Date(Date.now()+15*60_000).toISOString()};}
  async createCustomerPortalSession(input: Parameters<BillingProviderAdapter["createCustomerPortalSession"]>[0]):Promise<CustomerPortalSession>{this.assertEnabled();return{url:input.returnUrl,expiresAt:new Date(Date.now()+15*60_000).toISOString()};}
  async handleWebhook(payload:unknown):Promise<BillingWebhookResult>{this.assertEnabled();const eventId=typeof payload==="object"&&payload&&"eventId" in payload?String(payload.eventId):crypto.randomUUID();const duplicate=processedEvents.has(eventId);processedEvents.add(eventId);return{eventId,processed:!duplicate,duplicate};}
  async cancelSubscription(subscriptionId:string){this.assertEnabled();void subscriptionId;}
}
