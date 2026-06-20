export interface StorageAdapter { get(key:string):Promise<string|null>; set(key:string,value:string):Promise<void> }
export interface ShareAdapter { share(data:{title:string;text?:string;url?:string}):Promise<void> }
export interface NotificationAdapter { requestPermission():Promise<boolean>; schedule(title:string,at:Date):Promise<void> }
export interface MediaUploadAdapter { upload(file:File,path:string):Promise<{url:string}> }
export const webStorageAdapter:StorageAdapter = { async get(key){ return typeof window==='undefined'?null:localStorage.getItem(key) }, async set(key,value){ if(typeof window!=='undefined') localStorage.setItem(key,value) } };
export const webShareAdapter:ShareAdapter = { async share(data){ if(typeof navigator==='undefined')return; if(navigator.share){await navigator.share(data);return} if(data.url)await navigator.clipboard.writeText(data.url) } };
