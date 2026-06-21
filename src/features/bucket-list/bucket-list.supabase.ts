import { createClient } from "@/lib/supabase/client";
import { requireCurrentCouple } from "@/features/couples/currentCouple";
import type { BucketListItem } from "@/types/database";
import { dispatchNotificationEvent } from "@/features/notifications/notification.events";

function map(row:{id:string;couple_id:string;title:string;category:BucketListItem["category"];completed_at:string|null}):BucketListItem{return{id:row.id,coupleId:row.couple_id,title:row.title,category:row.category,completed:Boolean(row.completed_at),completedAt:row.completed_at||undefined};}
export const liveBucketListService={
 async list():Promise<BucketListItem[]>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const {coupleId}=await requireCurrentCouple(client);const {data,error}=await client.from("bucket_list_items").select("id,couple_id,title,category,completed_at").eq("couple_id",coupleId).neq("status","archived").order("created_at",{ascending:false});if(error)throw error;return(data||[]).map(map);},
 async create(title:string):Promise<BucketListItem>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const {user,coupleId}=await requireCurrentCouple(client);const {data,error}=await client.from("bucket_list_items").insert({couple_id:coupleId,created_by:user.id,title:title.trim(),category:"Dreams",status:"planned"}).select("id,couple_id,title,category,completed_at").single();if(error)throw error;void dispatchNotificationEvent({type:"bucket_item_added",coupleId,sourceEntityType:"bucket_item",sourceEntityId:data.id});return map(data);},
 async toggle(item:BucketListItem):Promise<void>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const{coupleId}=await requireCurrentCouple(client);const completedAt=item.completed?null:new Date().toISOString();const {error}=await client.from("bucket_list_items").update({completed_at:completedAt,status:completedAt?"completed":"planned"}).eq("id",item.id);if(error)throw error;if(completedAt)void dispatchNotificationEvent({type:"bucket_item_completed",coupleId,sourceEntityType:"bucket_item",sourceEntityId:item.id});}
};
