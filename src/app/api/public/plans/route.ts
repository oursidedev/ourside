import { NextResponse } from "next/server";
import { getPublicPlans } from "@/features/billing/plans.service";
import { publicPlan } from "@/features/billing/plans.mapper";
export const dynamic="force-dynamic";
export async function GET(){const plans=(await getPublicPlans()).filter(plan=>plan.isActive&&plan.isPublic).sort((a,b)=>a.displayOrder-b.displayOrder).map(publicPlan);return NextResponse.json({plans},{headers:{"Cache-Control":"public, s-maxage=60, stale-while-revalidate=300"}});}
