/** Web-only URL sanitizer. Shared/mobile analytics must implement the same contract. */
const SENSITIVE_SEGMENTS=["invite","reset-password","auth","callback"];
export function sanitizeAnalyticsPath(input:string){try{const url=new URL(input,"https://getourside.com");if(SENSITIVE_SEGMENTS.some(segment=>url.pathname.toLowerCase().includes(`/${segment}/`)))return `/${url.pathname.split('/').filter(Boolean)[0]||''}/[redacted]`;return url.pathname.slice(0,300)||"/";}catch{return"/"}}
export function safeReferrerHost(input:string){try{return new URL(input).hostname.slice(0,120)}catch{return null}}
export function browserFamily(ua:string){if(/Edg/i.test(ua))return"Edge";if(/Chrome/i.test(ua))return"Chrome";if(/Safari/i.test(ua)&&!/Chrome/i.test(ua))return"Safari";if(/Firefox/i.test(ua))return"Firefox";return"Other"}
export function deviceType(ua:string){return /Mobile|Android|iPhone|iPad/i.test(ua)?"mobile":"desktop"}
