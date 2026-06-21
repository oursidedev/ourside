/** Server-only plan-change email copy. Plan access is changed by the database RPC, never by this email. */
import { appUrl, marketingUrl } from "@/config/brand";

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);

export function renderPlanChangeEmail(input: { displayName?: string | null; fromPlan: string; toPlan: string; toPlanName: string }) {
  const name = escapeHtml(input.displayName?.trim() || "there");
  const plan = escapeHtml(input.toPlanName);
  const settingsUrl = appUrl("/settings");
  const supportUrl = marketingUrl("/support");
  return {
    subject: `Your Ourside plan is now ${input.toPlanName}`,
    text: `Hi ${input.displayName?.trim() || "there"},\n\nYour Ourside plan changed from ${input.fromPlan} to ${input.toPlanName}. Your access has been updated immediately.\n\nView your account: ${settingsUrl}\nIf you did not expect this change, contact us: ${supportUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#faf6ef;color:#362629;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:48px 24px"><div style="font-family:Georgia,serif;font-size:26px">Our<em style="color:#8b3947">side</em></div><div style="margin-top:28px;background:#fffdf9;border:1px solid #eadfda;border-radius:22px;padding:34px"><p style="color:#8b3947;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Plan update</p><h1 style="font-family:Georgia,serif;font-size:34px;line-height:1.15">Your plan is now ${plan}</h1><p style="line-height:1.7;color:#6e5b5f">Hi ${name}, your Ourside access has been updated immediately. You can review your account below.</p><a href="${settingsUrl}" style="display:inline-block;margin-top:18px;border-radius:999px;background:#712c36;color:white;padding:14px 22px;text-decoration:none;font-weight:bold">Open Ourside</a></div><p style="margin-top:24px;font-size:12px;color:#9a898c">Didn’t expect this change? <a href="${supportUrl}">Contact support</a>.</p></div></body></html>`,
  };
}
