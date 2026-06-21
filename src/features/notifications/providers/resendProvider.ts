/**
 * Server-only Resend adapter for product emails.
 *
 * This is separate from Supabase Auth SMTP. Never import it from a Client
 * Component and never expose RESEND_API_KEY with a NEXT_PUBLIC_ prefix.
 */
import type { EmailProvider, SendEmailInput, SendEmailResult } from "./emailProvider";

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "Ourside <noreply@getourside.com>";
    if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not configured" };

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [input.to], reply_to: process.env.EMAIL_REPLY_TO, subject: input.subject, html: input.html, text: input.text, tags: input.tags ? Object.entries(input.tags).map(([name, value]) => ({ name, value })) : undefined }),
      });
      const data = await response.json().catch(() => ({})) as { id?: string; message?: string };
      if (!response.ok) return { ok: false, error: data.message || `Resend returned ${response.status}` };
      return { ok: true, providerId: data.id };
    } catch {
      return { ok: false, error: "Email provider could not be reached" };
    }
  }
}
