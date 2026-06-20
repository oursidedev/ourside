import { createClient } from "@/lib/supabase/client";
import { requireCurrentCouple } from "@/features/couples/currentCouple";
import type { Milestone } from "@/types/database";
import { dispatchNotificationEvent } from "@/features/notifications/notification.events";

export const liveMilestoneService={
 async list():Promise<Milestone[]>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const {coupleId}=await requireCurrentCouple(client);const {data,error}=await client.from("milestones").select("id,couple_id,title,milestone_date,icon,note").eq("couple_id",coupleId).order("milestone_date");if(error)throw error;return (data||[]).map(row=>({id:row.id,coupleId:row.couple_id,title:row.title,date:row.milestone_date,icon:row.icon,note:row.note||undefined}));},
 async create(input:{title:string;date:string}):Promise<Milestone>{const client=createClient();if(!client)throw new Error("Supabase is not configured.");const {user,coupleId}=await requireCurrentCouple(client);const {data,error}=await client.from("milestones").insert({couple_id:coupleId,created_by:user.id,title:input.title.trim(),milestone_date:input.date,icon:"heart",type:"custom"}).select("id,couple_id,title,milestone_date,icon,note").single();if(error)throw error;void dispatchNotificationEvent({type:"milestone_created",coupleId,sourceEntityType:"milestone",sourceEntityId:data.id});return{id:data.id,coupleId:data.couple_id,title:data.title,date:data.milestone_date,icon:data.icon,note:data.note||undefined};}
};
