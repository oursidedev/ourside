import { createClient } from "./client";

/** Couple tables remain protected by RLS; realtime only triggers a scoped repository reload. */
export function subscribeToTable(table:string,onChange:()=>void){const client=createClient();if(!client)return()=>{};const channel=client.channel(`ourside:${table}:${crypto.randomUUID()}`).on("postgres_changes",{event:"*",schema:"public",table},onChange).subscribe();return()=>{void client.removeChannel(channel);};}

