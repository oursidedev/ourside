import type { EmailProvider,SendEmailInput } from "./emailProvider";
/** TODO: dynamically load SendGrid on the server when provider credentials exist. */
export class SendGridProviderPlaceholder implements EmailProvider{readonly name="sendgrid";async sendEmail(input:SendEmailInput){void input;return{ok:false,error:"SendGrid is not configured."};}}

