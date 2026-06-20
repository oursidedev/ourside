/** Browser client uses only the public anon key. Service-role credentials must never enter this module. */
import { createBrowserClient } from '@supabase/ssr';
export function createClient(){ const url=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if(!url||!key) return null; return createBrowserClient(url,key) }
