import type { EmailProvider,SendEmailInput,SendEmailResult } from "./emailProvider";
export class MockEmailProvider implements EmailProvider{readonly name="mock";async sendEmail(input:SendEmailInput):Promise<SendEmailResult>{if(process.env.NODE_ENV!=="production")console.info("[mock-email]",{to:input.to,subject:input.subject});return{ok:true,providerId:`mock-${Date.now()}`};}}

