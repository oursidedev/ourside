import type { PushProvider,SendPushInput } from "./pushProvider";
/** TODO: validate Expo push receipts when the native app is introduced. */
export class ExpoPushProviderPlaceholder implements PushProvider{readonly name="expo";async sendPush(input:SendPushInput){void input;return{ok:false,error:"Expo Push is not configured."};}}

