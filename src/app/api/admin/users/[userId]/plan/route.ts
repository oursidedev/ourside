import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { renderPlanChangeEmail } from "@/features/billing/plan-change-email";
import { requireAdmin } from "@/features/admin/admin.server";
import { ResendEmailProvider } from "@/features/notifications/providers/resendProvider";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ planSlug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/), reason: z.string().max(300).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdmin();
    const { userId } = await params;
    if (!z.string().uuid().safeParse(userId).success) return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });

    const db = await createServerSupabaseClient();
    const { data, error } = await db!.rpc("admin_assign_user_plan", { target_user: userId, target_plan: parsed.data.planSlug, change_reason: parsed.data.reason || null });
    if (error) throw error;
    const change = data as { email: string; displayName?: string | null; fromPlan: string; toPlan: string; toPlanName: string; notificationId?: string | null };

    const email = renderPlanChangeEmail(change);
    const delivery = await new ResendEmailProvider().sendEmail({ to: change.email, subject: email.subject, html: email.html, text: email.text, tags: { category: "plan-change" } });
    await db!.rpc("admin_record_plan_email", { target_user: userId, target_notification: change.notificationId || null, delivery_status: delivery.ok ? "sent" : "failed", provider_id: delivery.providerId || null, error_message: delivery.error || null });

    return NextResponse.json({ ok: true, plan: change.toPlan, email: { sent: delivery.ok, error: delivery.error } });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Plan could not be changed" }, { status: 400 });
  }
}
