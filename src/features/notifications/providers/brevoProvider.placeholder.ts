import type { EmailProvider,SendEmailInput } from "./emailProvider";
/** TODO: add the Brevo server adapter without exposing its API key to clients. */
export class BrevoProviderPlaceholder implements EmailProvider{readonly name="brevo";async sendEmail(input:SendEmailInput){void input;return{ok:false,error:"Brevo is not configured."};}}

