/** Server composition root. Provider SDKs and secret keys must only be introduced behind this module. */
import { BillingService } from "./billing.service"; import { MockBillingProvider } from "./providers/mockBillingProvider"; import { MOCK_BILLING_ENABLED } from "./billing.constants";
export function createBillingService(){if(MOCK_BILLING_ENABLED)return new BillingService(new MockBillingProvider());throw new Error("No production billing provider is configured.");}
