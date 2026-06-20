import type { EmailProvider,SendEmailInput } from "./emailProvider";
/** TODO: verify Postmark responses and process delivery webhooks server-side. */
export class PostmarkProviderPlaceholder implements EmailProvider{readonly name="postmark";async sendEmail(input:SendEmailInput){void input;return{ok:false,error:"Postmark is not configured."};}}

