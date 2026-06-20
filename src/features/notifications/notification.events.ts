import { createClient } from "@/lib/supabase/client";
import type { NotificationEventInput } from "./notification.types";
/** Events go through a database dispatcher so clients cannot choose arbitrary recipients. */
export async function dispatchNotificationEvent(event:NotificationEventInput){const client=createClient();if(!client)return;const{error}=await client.rpc("dispatch_notification_event",{input_type:event.type,target_couple:event.coupleId||null,source_type:event.sourceEntityType||null,source_id:event.sourceEntityId||null,event_metadata:event.metadata||{},confirmation:event.confirmation||false});if(error&&process.env.NODE_ENV!=="production")console.warn("Notification dispatch skipped:",error.message);}

