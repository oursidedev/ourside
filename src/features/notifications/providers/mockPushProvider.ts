import type { PushProvider,SendPushInput } from "./pushProvider";
export class MockPushProvider implements PushProvider{readonly name="mock";async sendPush(input:SendPushInput){void input;return{ok:true};}}

