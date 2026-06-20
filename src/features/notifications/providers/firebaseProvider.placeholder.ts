import type { PushProvider,SendPushInput } from "./pushProvider";
/** TODO: validate FCM device tokens and send only from a trusted worker. */
export class FirebaseProviderPlaceholder implements PushProvider{readonly name="firebase";async sendPush(input:SendPushInput){void input;return{ok:false,error:"Firebase is not configured."};}}

