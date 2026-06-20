export interface SendEmailInput{to:string;subject:string;html:string;text:string;tags?:Record<string,string>}
export interface SendEmailResult{ok:boolean;providerId?:string;error?:string}
/** Provider SDKs belong in server-only adapters; never call them from notification UI. */
export interface EmailProvider{readonly name:string;sendEmail(input:SendEmailInput):Promise<SendEmailResult>}

