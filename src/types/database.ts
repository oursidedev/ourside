export type ID = string;
export interface User { id:ID; firstName:string; lastName:string; name:string; email:string; avatarUrl?:string }
export interface Couple { id:ID; name:string; startDate:string; coverUrl?:string; style:'classic'|'warm'|'minimal' }
export interface CoupleMember { id:ID; coupleId:ID; userId:ID; role:'owner'|'partner' }
export interface Memory { id:ID; coupleId:ID; title:string; note:string; date:string; type:'photo'|'note'|'video'; imageUrl?:string; location?:string; mood?:string; author:string; favorite?:boolean }
export interface MemoryMedia { id:ID; memoryId:ID; url:string; type:'image'|'video'|'audio'; alt:string }
export interface Album { id:ID; coupleId:ID; title:string; coverUrl:string; count:number }
export interface Letter { id:ID; coupleId:ID; title:string; body?:string; unlockAt:string; author:string; locked:boolean }
export interface Milestone { id:ID; coupleId:ID; title:string; date:string; icon:string; note?:string }
export interface BucketListItem { id:ID; coupleId:ID; title:string; category:'Travel'|'Food'|'Experiences'|'Home'|'Dreams'|'Random'; completed:boolean; imageUrl?:string }
export interface DailyQuestion { id:ID; prompt:string; date:string }
export interface DailyAnswer { id:ID; questionId:ID; userId:ID; answer:string; revealed:boolean }
export interface Notification { id:ID; userId:ID; title:string; read:boolean; createdAt:string }
