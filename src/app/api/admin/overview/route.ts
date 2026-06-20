import { NextResponse } from "next/server";import { getAdminOverview } from "@/features/admin/admin.server";
export async function GET(){try{return NextResponse.json(await getAdminOverview());}catch{return NextResponse.json({error:"Not found"},{status:404});}}
