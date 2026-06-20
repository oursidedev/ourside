import { NextRequest,NextResponse } from "next/server"; import { MOCK_BILLING_ENABLED } from "@/features/billing/billing.constants"; import { MockBillingProvider } from "@/features/billing/providers/mockBillingProvider";
export async function POST(request:NextRequest,{params}:{params:Promise<{provider:string}>}){const {provider}=await params;const payload=await request.json().catch(()=>null);if(provider==="mock"&&MOCK_BILLING_ENABLED)return NextResponse.json(await new MockBillingProvider().handleWebhook(payload));
  // Real providers must verify the raw body signature, insert billing_events by unique event_id, then update subscriptions in one server transaction.
  return NextResponse.json({error:"Provider webhook is not configured."},{status:501});}
