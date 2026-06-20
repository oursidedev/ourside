export interface SendPushInput{userId:string;title:string;body:string;actionUrl?:string;data?:Record<string,string>}
export interface PushProvider{readonly name:string;sendPush(input:SendPushInput):Promise<{ok:boolean;error?:string}>}

