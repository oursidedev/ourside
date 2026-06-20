"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { MemoryCard } from "@/components/MemoryCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Bilingual } from "@/components/Bilingual";
import { useToast } from "@/components/ui/ToastProvider";
import { MemoryCardSkeleton } from "@/components/shared/loading/Skeletons";
import { liveMemoryService } from "@/features/memories/memory.supabase";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { Memory } from "@/types/database";
import { EmptyState } from "@/components/shared/empty-states/EmptyState";

const filters = ["All Memories", "Photos", "Notes", "Videos", "Places", "Favorites", "This Year"];
export default function MemoriesPage() {
  const [items, setItems] = useState<Memory[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [active, setActive] = useState("All Memories"); const [query, setQuery] = useState(""); const { toast } = useToast();
  const load = useCallback(async () => { try { setItems(await liveMemoryService.list()); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Memories could not be loaded."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); return subscribeToTable("memories", () => void load()); }, [load]);
  const filtered = useMemo(() => items.filter((memory) => { const text = `${memory.title} ${memory.note} ${memory.location || ""}`.toLowerCase(); const matchesQuery = text.includes(query.trim().toLowerCase()); const matchesFilter = active === "All Memories" || (active === "Photos" && Boolean(memory.imageUrl)) || (active === "Notes" && !memory.imageUrl) || (active === "Videos" && memory.type === "video") || (active === "Places" && Boolean(memory.location)) || (active === "Favorites" && Boolean(memory.favorite)) || (active === "This Year" && new Date(memory.date).getFullYear() === new Date().getFullYear()); return matchesQuery && matchesFilter; }), [active, items, query]);
  return <div><header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow"><Bilingual en="Every piece of us" tr="Bizden her parça" /></p><h1 className="mt-2 font-serif text-4xl sm:text-5xl"><Bilingual en="Our memory timeline" tr="Anı zaman çizelgemiz" /></h1><p className="mt-2 text-sm text-ink/50">{items.length} shared moments, one unfolding story.</p></div><PremiumButton href="/memories/new"><Plus className="h-4 w-4" />Add memory</PremiumButton></header>
    <div className="mt-8 flex flex-col gap-3 xl:flex-row"><label className="relative max-w-md flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" /><input aria-label="Search memories" placeholder="Search a date, place, or feeling…" className="focus-ring h-12 w-full rounded-full border bg-paper pl-11 pr-4" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="flex gap-2 overflow-x-auto pb-2">{filters.map((filter) => <button key={filter} onClick={() => setActive(filter)} className={`focus-ring min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ${active === filter ? "bg-wine text-white" : "border bg-paper"}`}>{filter}</button>)}</div><button aria-label="More filters" className="focus-ring grid h-12 w-12 shrink-0 place-items-center rounded-full border bg-paper" onClick={() => toast("Date and mood filters are coming soon.")}><SlidersHorizontal className="h-4 w-4" /></button></div>
    {loading ? <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <MemoryCardSkeleton key={index} />)}</div> : error ? <p role="alert" className="mt-10 rounded-xl bg-red-50 p-4 text-red-800">{error}</p> : filtered.length ? <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}</div> : <div className="mt-10">{items.length===0?<EmptyState title="No memories here yet" description="Start with a photo, a note, or a moment you never want to forget." actionLabel="Add your first memory" actionHref="/memories/new" secondaryLabel="Invite your partner" secondaryHref="/settings?invite=1"/>:<EmptyState title="Nothing found" description="Try a different word, date, or filter." actionLabel="Clear search" onAction={()=>{setQuery("");setActive("All Memories");}}/>}</div>}
    <PremiumButton href="/memories/new" className="fixed bottom-24 right-5 z-40 h-14 w-14 p-0 md:hidden"><Plus /></PremiumButton></div>;
}
