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
    const change = data as { fromPlan: string; toPlan: string; toPlanName: string; recipients: Array<{ userId: string; email: string; displayName?: string | null; notificationId?: string | null }> };
    const provider = new ResendEmailProvider();
    const deliveries = await Promise.all(change.recipients.map(async (recipient) => {
      const email = renderPlanChangeEmail({ ...change, displayName: recipient.displayName });
      const delivery = await provider.sendEmail({ to: recipient.email, subject: email.subject, html: email.html, text: email.text, tags: { category: "plan-change" } });
      await db!.rpc("admin_record_plan_email", { target_user: recipient.userId, target_notification: recipient.notificationId || null, delivery_status: delivery.ok ? "sent" : "failed", provider_id: delivery.providerId || null, error_message: delivery.error || null });
      return { userId: recipient.userId, sent: delivery.ok, error: delivery.error };
    }));
    const sentCount = deliveries.filter((delivery) => delivery.sent).length;
    const errors = deliveries.flatMap((delivery) => delivery.error ? [delivery.error] : []);
    return NextResponse.json({ ok: true, plan: change.toPlan, email: { sent: sentCount === deliveries.length, sentCount, recipientCount: deliveries.length, error: errors[0] } });
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "Plan could not be changed" }, { status: 400 });
  }
}
