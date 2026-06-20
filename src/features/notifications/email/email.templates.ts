/**
 * Notification email renderer.
 *
 * Product actions belong on the app domain; legal links belong on the public
 * marketing domain. Provider-specific delivery remains outside this template.
 */
import { appUrl, marketingUrl } from "@/config/brand";
import { NOTIFICATION_COPY } from "../notification.templates";
import type { NotificationType } from "../notification.types";

export function renderNotificationEmail(type: NotificationType, actionUrl?: string) {
  const copy = NOTIFICATION_COPY[type];
  // Even provider-supplied absolute action URLs are normalized onto the app
  // host so notification CTAs cannot drift back to the marketing domain.
  const parsedAction = actionUrl ? new URL(actionUrl, appUrl()) : null;
  const safeUrl = parsedAction ? appUrl(`${parsedAction.pathname}${parsedAction.search}${parsedAction.hash}`) : appUrl("/dashboard");
  const privacyUrl = marketingUrl("/privacy");
  const termsUrl = marketingUrl("/terms");

  return {
    subject: copy.title,
    previewText: copy.body,
    text: `${copy.title}\n\n${copy.body}\n\nOpen Ourside: ${safeUrl}\nPrivacy: ${privacyUrl}\nTerms: ${termsUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#faf6ef;color:#362629;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:48px 24px"><div style="font-family:Georgia,serif;font-size:26px">Our<em style="color:#8b3947">side</em></div><div style="margin-top:28px;background:#fffdf9;border:1px solid #eadfda;border-radius:22px;padding:34px"><h1 style="font-family:Georgia,serif;font-size:34px;line-height:1.15">${copy.title}</h1><p style="line-height:1.7;color:#6e5b5f">${copy.body}</p><a href="${safeUrl}" style="display:inline-block;margin-top:18px;border-radius:999px;background:#712c36;color:white;padding:14px 22px;text-decoration:none;font-weight:bold">Open Ourside</a></div><p style="margin-top:24px;font-size:12px;color:#9a898c">Private by design. <a href="${privacyUrl}">Privacy</a> · <a href="${termsUrl}">Terms</a></p></div></body></html>`,
  };
}
