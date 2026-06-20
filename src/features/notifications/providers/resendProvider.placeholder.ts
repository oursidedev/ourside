import type { EmailProvider,SendEmailInput } from "./emailProvider";
/** Server-only placeholder. TODO: implement with RESEND_API_KEY and verified webhook delivery. */
export class ResendProviderPlaceholder implements EmailProvider{readonly name="resend";async sendEmail(input:SendEmailInput){void input;return{ok:false,error:"Resend is not configured."};}}

