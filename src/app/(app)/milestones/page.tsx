"use client";
import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Coffee, Heart, Home, Plane } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Bilingual } from "@/components/Bilingual";
import { useToast } from "@/components/ui/ToastProvider";
import { liveMilestoneService } from "@/features/milestones/milestone.supabase";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { Milestone } from "@/types/database";
import { EmptyState } from "@/components/shared/empty-states/EmptyState";
const iconMap = { coffee: Coffee, heart: Heart, plane: Plane, home: Home };
const positions = ["left top", "right top", "left bottom", "right bottom"];
export default function Milestones() {
  const [items, setItems] = useState<Milestone[]>([]); const [adding, setAdding] = useState(false); const [title, setTitle] = useState(""); const [date, setDate] = useState(""); const [busy,setBusy]=useState(false); const { toast } = useToast();
  const load=useCallback(async()=>{try{setItems(await liveMilestoneService.list());}catch(error){toast(error instanceof Error?error.message:"Milestones could not be loaded.","error");}},[toast]);
  useEffect(()=>{void load();return subscribeToTable("milestones",()=>void load());},[load]);
  async function addMilestone(event: React.FormEvent) { event.preventDefault();if(busy)return;setBusy(true);try{const created=await liveMilestoneService.create({title,date});setItems(current=>[...current,created]);setAdding(false);setTitle("");setDate("");toast("Milestone shared with your partner.","success");}catch(error){toast(error instanceof Error?error.message:"Milestone could not be saved.","error");}finally{setBusy(false);} }
  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow"><Bilingual en="The days that changed us" tr="Bizi değiştiren günler" /></p>
          <h1 className="mt-2 font-serif text-5xl"><Bilingual en="Our milestones" tr="Dönüm noktalarımız" /></h1>
          <p className="mt-2 text-sm text-ink/50">
            The firsts, the leaps, and everything that made us more us.
          </p>
        </div>
        <PremiumButton type="button" onClick={() => setAdding(true)}>
          <CalendarPlus className="h-4 w-4" /> Add milestone
        </PremiumButton>
      </header>
      {items.length===0?<div className="mt-12"><EmptyState title="No milestones yet" description="Mark the dates that matter — first dates, anniversaries, trips, and little turning points." actionLabel="Add a milestone" onAction={()=>setAdding(true)}/></div>:<div className="relative mx-auto mt-16 max-w-5xl pl-9">
        <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-wine via-rose/50 to-transparent" />
        {items.map((m, i) => {
          const Icon = iconMap[m.icon as keyof typeof iconMap] || Heart;
          return (
            <article
              key={m.id}
              className="relative mb-8 overflow-hidden rounded-[1.5rem] border bg-paper shadow-card"
            >
              <span className="absolute -left-[2.15rem] top-8 z-10 grid h-10 w-10 place-items-center rounded-full bg-wine text-white ring-8 ring-cream">
                <Icon className="h-4 w-4" />
              </span>
              <div className="grid sm:grid-cols-[210px_1fr]">
                <div
                  role="img"
                  aria-label={`Editorial memory for ${m.title}`}
                  className="min-h-44 bg-cover sm:min-h-full"
                  style={{
                    backgroundImage: "url('/images/ourside-milestones.png')",
                    backgroundSize: "200% 200%",
                    backgroundPosition: positions[i % positions.length],
                  }}
                />
                <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:p-8">
                  <div>
                    <p className="eyebrow">
                      Milestone {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-2 font-serif text-3xl">{m.title}</h2>
                    {m.note && (
                      <p className="mt-3 max-w-xl font-serif text-lg italic leading-7 text-ink/55">
                        “{m.note}”
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs font-bold text-wine">
                    {new Date(m.date).toLocaleDateString("en", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </article>
          );
        })}
        <div className="relative rounded-[1.5rem] border border-dashed bg-paper/50 p-8 text-center">
          <Heart className="mx-auto text-rose" />
          <h3 className="mt-3 font-serif text-2xl">
            The next first is still ahead.
          </h3>
          <button type="button" onClick={() => setAdding(true)} className="mt-3 text-sm font-bold text-wine">
            Add it when it happens
          </button>
        </div>
      </div>}
      {adding && <div className="fixed inset-0 z-[150] grid place-items-center bg-ink/45 p-5" role="dialog" aria-modal="true"><form onSubmit={addMilestone} className="w-full max-w-md rounded-[1.5rem] bg-paper p-6 shadow-warm"><p className="eyebrow">A day that changed us</p><h2 className="mt-2 font-serif text-3xl">Add milestone</h2><label className="mt-5 block text-sm font-bold">Title<input autoFocus required value={title} onChange={event => setTitle(event.target.value)} className="focus-ring mt-2 h-13 w-full rounded-xl border bg-cream px-4" placeholder="Our first trip"/></label><label className="mt-4 block text-sm font-bold">Date<input required type="date" value={date} onChange={event => setDate(event.target.value)} className="focus-ring mt-2 h-13 w-full rounded-xl border bg-cream px-4"/></label><div className="mt-6 flex gap-3"><PremiumButton type="button" variant="secondary" onClick={() => setAdding(false)}>Cancel</PremiumButton><PremiumButton type="submit" disabled={busy || !title.trim() || !date} ariaBusy={busy}>{busy ? "Saving…" : "Add milestone"}</PremiumButton></div></form></div>}
    </div>
  );
}
