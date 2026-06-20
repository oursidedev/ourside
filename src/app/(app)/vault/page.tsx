"use client";
import { useCallback, useEffect, useState } from "react";
import { PenLine, ShieldCheck } from "lucide-react";
import { FutureLetterCard } from "@/components/FutureLetterCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Bilingual } from "@/components/Bilingual";
import { useToast } from "@/components/ui/ToastProvider";
import { liveLetterService } from "@/features/letters/letter.supabase";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { Letter } from "@/types/database";
import { VaultSkeleton } from "@/components/shared/loading/Skeletons";
import { EmptyState } from "@/components/shared/empty-states/EmptyState";
export default function Vault() {
  const [items,setItems]=useState<Letter[]>([]);const [loading,setLoading]=useState(true);const [compose, setCompose] = useState(false); const [title, setTitle] = useState(""); const [body, setBody] = useState("");const[unlockAt,setUnlockAt]=useState(()=>{const date=new Date();date.setFullYear(date.getFullYear()+1);return date.toISOString().slice(0,16);});const[busy,setBusy]=useState(false); const { toast } = useToast();
  const load=useCallback(async()=>{try{setItems(await liveLetterService.list());}catch(error){toast(error instanceof Error?error.message:"Letters could not be loaded.","error");}finally{setLoading(false);}},[toast]);
  useEffect(()=>{void load();return subscribeToTable("letters",()=>void load());},[load]);
  async function saveDraft(event: React.FormEvent) { event.preventDefault();if(busy)return;setBusy(true);try{await liveLetterService.create({title,body,unlockAt});await load();setCompose(false);setTitle("");setBody("");toast("Your sealed letter was saved.","success");}catch(error){toast(error instanceof Error?error.message:"Letter could not be saved.","error");}finally{setBusy(false);} }
  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow"><Bilingual en="Words across time" tr="Zamanı aşan sözler" /></p>
          <h1 className="mt-2 font-serif text-5xl"><Bilingual en="The Ourside Vault" tr="Ourside Kasası" /></h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/50">
            Write what you feel now. Choose the moment it should be felt again.
          </p>
        </div>
        <PremiumButton type="button" onClick={() => setCompose(true)}>
          <PenLine className="h-4 w-4" /> Compose a letter
        </PremiumButton>
      </header>
      <div className="mt-9 flex items-center gap-3 rounded-2xl border border-wine/10 bg-wine/5 p-4 text-sm text-wine">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <p>
          Sealed letters stay private until their unlock date. Not even the
          recipient can peek early.
        </p>
      </div>
      {loading ? <div className="mt-10"><VaultSkeleton /></div> : items.length===0?<div className="mt-10"><EmptyState title="No future letters yet" description="Write something today and choose when your partner can open it." actionLabel="Write a future letter" onAction={()=>setCompose(true)}/></div>:<><section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">Waiting for their day</h2>
          <span className="text-xs font-bold text-ink/40">{items.filter(letter => letter.locked).length} sealed</span>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items
            .filter((l) => l.locked)
            .map((l) => (
              <FutureLetterCard key={l.id} letter={l} />
            ))}
        </div>
      </section></>}
      <section className="mt-12">
        <h2 className="font-serif text-3xl">Letters we can hold</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {items
            .filter((l) => !l.locked)
            .map((l) => (
              <FutureLetterCard key={l.id} letter={l} />
            ))}
        </div>
      </section>
      <section className="mt-12 rounded-[2rem] bg-ink p-8 text-white sm:p-12">
        <p className="eyebrow !text-rose">A letter without a date</p>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl">
          Some words are waiting for the right future.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
          Begin writing now. You can choose who it is for and when it opens
          later.
        </p>
        <PremiumButton type="button" onClick={() => setCompose(true)} className="mt-7 bg-[#f2d8d3] text-wine">
          Start a private draft
        </PremiumButton>
      </section>
      {compose && <div className="fixed inset-0 z-[150] flex items-end bg-ink/45 sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" onMouseDown={event => { if (event.currentTarget === event.target) setCompose(false); }}><form onSubmit={saveDraft} className="w-full max-w-xl rounded-t-[2rem] bg-paper p-6 shadow-warm sm:rounded-[2rem] sm:p-8"><p className="eyebrow">Private letter</p><h2 className="mt-2 font-serif text-4xl">Write across time.</h2><label className="mt-6 block text-sm font-bold">Title<input autoFocus required value={title} onChange={event => setTitle(event.target.value)} className="focus-ring mt-2 h-13 w-full rounded-xl border bg-cream px-4" placeholder="For the day we move in together"/></label><label className="mt-4 block text-sm font-bold">Open date<input required type="datetime-local" value={unlockAt} min={new Date().toISOString().slice(0,16)} onChange={event => setUnlockAt(event.target.value)} className="focus-ring mt-2 h-13 w-full rounded-xl border bg-cream px-4"/></label><label className="mt-4 block text-sm font-bold">Letter<textarea required value={body} onChange={event => setBody(event.target.value)} className="focus-ring mt-2 min-h-36 w-full rounded-xl border bg-cream p-4" placeholder="Write what you want them to feel later…"/></label><div className="mt-6 flex gap-3"><PremiumButton type="button" variant="secondary" onClick={() => setCompose(false)}>Cancel</PremiumButton><PremiumButton type="submit" disabled={busy || !title.trim() || !body.trim() || !unlockAt} ariaBusy={busy}>{busy ? "Sealing…" : "Seal letter"}</PremiumButton></div></form></div>}
    </div>
  );
}
