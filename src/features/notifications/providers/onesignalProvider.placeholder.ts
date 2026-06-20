import type { PushProvider,SendPushInput } from "./pushProvider";
/** TODO: add OneSignal REST delivery in the server notification worker. */
export class OneSignalProviderPlaceholder implements PushProvider{readonly name="onesignal";async sendPush(input:SendPushInput){void input;return{ok:false,error:"OneSignal is not configured."};}}

