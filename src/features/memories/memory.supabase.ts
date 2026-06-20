import { createClient } from "@/lib/supabase/client";
import { requireCurrentCouple } from "@/features/couples/currentCouple";
import type { Memory } from "@/types/database";
import { dispatchNotificationEvent } from "@/features/notifications/notification.events";

type MemoryRow = { id:string;couple_id:string;author_id:string;title:string;note:string;memory_date:string;type:"photo"|"note"|"video";location:string|null;mood:string|null;is_favorite:boolean;memory_media?:Array<{storage_path_medium:string|null;storage_path_thumbnail:string|null;url:string|null;sort_order:number}> };

export const liveMemoryService = {
  async list(): Promise<Memory[]> {
    const client=createClient(); if(!client) throw new Error("Supabase is not configured.");
    const {coupleId}=await requireCurrentCouple(client);
    const result=await client.from("memories").select("id,couple_id,author_id,title,note,memory_date,type,location,mood,is_favorite,memory_media(storage_path_medium,storage_path_thumbnail,url,sort_order)").eq("couple_id",coupleId).order("memory_date",{ascending:false}).limit(100);
    if(result.error) throw result.error;
    const rows=(result.data||[]) as MemoryRow[];
    const authorIds=[...new Set(rows.map(row=>row.author_id))];
    const profiles=authorIds.length?await client.from("profiles").select("id,display_name").in("id",authorIds):{data:[],error:null};
    const names=new Map((profiles.data||[]).map(profile=>[profile.id,profile.display_name]));
    return Promise.all(rows.map(async row=>{
      const media=[...(row.memory_media||[])].sort((a,b)=>a.sort_order-b.sort_order)[0];
      const path=media?.storage_path_medium||media?.storage_path_thumbnail||media?.url||null;
      let imageUrl:string|undefined;
      if(path?.startsWith("http")) imageUrl=path;
      else if(path){const signed=await client.storage.from("couple-media").createSignedUrl(path,3600);if(!signed.error)imageUrl=signed.data.signedUrl;}
      return {id:row.id,coupleId:row.couple_id,title:row.title,note:row.note,date:row.memory_date,type:row.type,imageUrl,location:row.location||undefined,mood:row.mood||undefined,author:names.get(row.author_id)||"Partner",favorite:row.is_favorite};
    }));
  },
  async get(id:string){return(await this.list()).find(memory=>memory.id===id)||null;},
  async update(id:string,input:{title:string;note:string}){const client=createClient();if(!client)throw new Error("Supabase is not configured.");await requireCurrentCouple(client);const{error}=await client.from("memories").update({title:input.title.trim(),note:input.note.trim(),description:input.note.trim()}).eq("id",id);if(error)throw error;},
  async setFavorite(id:string,value:boolean){const client=createClient();if(!client)throw new Error("Supabase is not configured.");await requireCurrentCouple(client);const{error}=await client.from("memories").update({is_favorite:value}).eq("id",id);if(error)throw error;},
  async remove(id:string){const client=createClient();if(!client)throw new Error("Supabase is not configured.");await requireCurrentCouple(client);const{error}=await client.from("memories").delete().eq("id",id);if(error)throw error;},
  async listComments(memoryId:string):Promise<Array<{id:string;body:string;author:string}>>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");await requireCurrentCouple(client);const{data,error}=await client.from("memory_comments").select("id,user_id,body").eq("memory_id",memoryId).order("created_at");if(error)throw error;const ids=[...new Set((data||[]).map(row=>row.user_id))];const profiles=ids.length?await client.from("profiles").select("id,display_name").in("id",ids):{data:[]};const names=new Map((profiles.data||[]).map(profile=>[profile.id,profile.display_name]));return(data||[]).map(row=>({id:row.id,body:row.body,author:names.get(row.user_id)||"Partner"}));},
  async addComment(memoryId:string,body:string){const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{user,coupleId}=await requireCurrentCouple(client);const{error}=await client.from("memory_comments").insert({couple_id:coupleId,memory_id:memoryId,user_id:user.id,body:body.trim()});if(error)throw error;void dispatchNotificationEvent({type:"memory_commented",coupleId,sourceEntityType:"memory",sourceEntityId:memoryId});}
};
