"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, Plus, SlidersHorizontal, Sparkles } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Bilingual } from "@/components/Bilingual";
import { useToast } from "@/components/ui/ToastProvider";
import { liveBucketListService } from "@/features/bucket-list/bucket-list.supabase";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { BucketListItem } from "@/types/database";
import { EmptyState } from "@/components/shared/empty-states/EmptyState";
export default function BucketList() {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [active, setActive] = useState("All");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [busy,setBusy]=useState(false);
  const { toast } = useToast();
  const load=useCallback(async()=>{try{setItems(await liveBucketListService.list());}catch(error){toast(error instanceof Error?error.message:"Shared plans could not be loaded.","error");}},[toast]);
  useEffect(()=>{void load();return subscribeToTable("bucket_list_items",()=>void load());},[load]);
  const toggle = async (item:BucketListItem) => {setItems(current=>current.map(value=>value.id===item.id?{...value,completed:!value.completed}:value));try{await liveBucketListService.toggle(item);toast("Shared plan updated for both of you.","success");}catch(error){setItems(current=>current.map(value=>value.id===item.id?item:value));toast(error instanceof Error?error.message:"Plan could not be updated.","error");}};
  const visible = active === "All" ? items : items.filter(item => item.category === active);
  async function addDream() { if (!title.trim()||busy) return;setBusy(true);try{const created=await liveBucketListService.create(title);setItems(current=>[created,...current]);setTitle("");setAdding(false);toast("Dream shared with your partner.","success");}catch(error){toast(error instanceof Error?error.message:"Dream could not be saved.","error");}finally{setBusy(false);} }
  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow"><Bilingual en="Someday, together" tr="Bir gün, birlikte" /></p>
          <h1 className="mt-2 font-serif text-5xl"><Bilingual en="Our shared list" tr="Ortak listemiz" /></h1>
          <p className="mt-2 text-sm text-ink/50">
            Dream it here. Live it together. Keep it forever.
          </p>
        </div>
        <PremiumButton type="button" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add a dream
        </PremiumButton>
      </header>
      <section className="mt-9 rounded-[1.5rem] border bg-paper p-6 shadow-card">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold">
              {items.filter((i) => i.completed).length} of {items.length} lived
            </p>
            <p className="mt-1 text-xs text-ink/45">
              Every checkmark becomes part of your story.
            </p>
          </div>
          <strong className="font-serif text-4xl text-wine">
            {items.length?Math.round((items.filter((i) => i.completed).length / items.length) * 100):0}
            %
          </strong>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-wine/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-wine to-rose transition-all"
            style={{
              width: `${items.length?(items.filter((i) => i.completed).length / items.length) * 100:0}%`,
            }}
          />
        </div>
      </section>
      <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
        {[
          "All",
          "Travel",
          "Food",
          "Experiences",
          "Home",
          "Dreams",
          "Random",
        ].map((x) => (
          <button
            key={x}
            onClick={() => setActive(x)}
            className={`focus-ring min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ${active === x ? "bg-wine text-white" : "border bg-paper"}`}
          >
            {x}
          </button>
        ))}
        <button
          aria-label="More filters"
          onClick={() => toast("Advanced filters are coming soon.")}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-paper"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
      {items.length===0?<div className="mt-6"><EmptyState title="No plans yet" description="Add places to visit, things to try, and dreams you want to complete together." actionLabel="Add your first plan" onAction={()=>setAdding(true)}/></div>:<div className="mt-6 grid gap-4 lg:grid-cols-2">
        {visible.map((item) => (
          <article
            key={item.id}
            className={`relative overflow-hidden rounded-[1.4rem] border bg-paper p-5 shadow-card transition ${item.completed ? "min-h-48 text-white" : ""}`}
          >
            {item.completed && item.imageUrl && (
              <>
                <Image
                  src={item.imageUrl}
                  alt="Completed goal memory"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10" />
              </>
            )}
            <div className="relative flex h-full items-start gap-4">
              <button
                onClick={() => void toggle(item)}
                aria-label={`${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.title}`}
                className={`focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border ${item.completed ? "border-white/30 bg-white text-wine" : "bg-cream text-transparent hover:text-wine"}`}
              >
                <Check className="h-4 w-4" />
              </button>
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${item.completed ? "text-white/60" : "text-wine/60"}`}
                >
                  {item.category}
                </span>
                <h2
                  className={`mt-1 font-serif text-2xl ${item.completed ? "line-through decoration-white/40" : ""}`}
                >
                  {item.title}
                </h2>
                {item.completed && (
                  <p className="mt-10 flex items-center gap-1 text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5" /> Lived on November 18,
                    2025
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>}
      {adding && <div className="fixed inset-0 z-[150] grid place-items-center bg-ink/45 p-5" role="dialog" aria-modal="true" onMouseDown={event => { if (event.currentTarget === event.target) setAdding(false); }}><form onSubmit={event => { event.preventDefault(); addDream(); }} className="w-full max-w-md rounded-[1.5rem] bg-paper p-6 shadow-warm"><p className="eyebrow">A future made together</p><h2 className="mt-2 font-serif text-3xl">Add a dream</h2><label className="mt-5 block text-sm font-bold">What do you want to do together?<input autoFocus value={title} onChange={event => setTitle(event.target.value)} className="focus-ring mt-2 h-13 w-full rounded-xl border bg-cream px-4" placeholder="Learn to make pasta in Italy"/></label><div className="mt-6 flex gap-3"><PremiumButton type="button" variant="secondary" onClick={() => setAdding(false)}>Cancel</PremiumButton><PremiumButton type="submit" disabled={busy || !title.trim()} ariaBusy={busy}>{busy ? "Saving…" : "Add dream"}</PremiumButton></div></form></div>}
    </div>
  );
}
