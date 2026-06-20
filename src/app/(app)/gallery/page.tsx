"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Grid3X3, Heart, Rows3, Upload, X } from "lucide-react";
import { albums } from "@/data/mock";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Bilingual } from "@/components/Bilingual";
import { useToast } from "@/components/ui/ToastProvider";
import { liveMemoryService } from "@/features/memories/memory.supabase";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { Memory } from "@/types/database";
import { GalleryGridSkeleton } from "@/components/shared/loading/Skeletons";
import { EmptyState } from "@/components/shared/empty-states/EmptyState";
export default function Gallery() {
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [memories,setMemories]=useState<Memory[]>([]);
  const [loading,setLoading]=useState(true);
  const momentsRef = useRef<HTMLElement>(null);
  const { toast } = useToast();
  const load=useCallback(async()=>{try{setMemories(await liveMemoryService.list());}catch(error){toast(error instanceof Error?error.message:"Gallery could not be loaded.","error");}finally{setLoading(false);}},[toast]);
  useEffect(()=>{void load();return subscribeToTable("memories",()=>void load());},[load]);
  const shownImages = memories.filter(memory=>memory.imageUrl&&(!favoritesOnly||memory.favorite)).map(memory=>memory.imageUrl!);
  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow"><Bilingual en="The view from here" tr="Buradan görünenler" /></p>
          <h1 className="mt-2 font-serif text-5xl"><Bilingual en="Our gallery" tr="Galerimiz" /></h1>
          <p className="mt-2 text-sm text-ink/50">
            A home for every frame that feels like us.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-full border bg-paper p-1">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`focus-ring grid h-10 w-10 place-items-center rounded-full ${view === "grid" ? "bg-wine text-white" : ""}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("timeline")}
              aria-label="Timeline view"
              className={`focus-ring grid h-10 w-10 place-items-center rounded-full ${view === "timeline" ? "bg-wine text-white" : ""}`}
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
          <PremiumButton href="/memories/new">
            <Upload className="h-4 w-4" /> Upload
          </PremiumButton>
        </div>
      </header>
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Collected chapters</p>
            <h2 className="mt-2 font-serif text-3xl">Albums</h2>
          </div>
          <button type="button" onClick={() => momentsRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-bold text-wine">See all</button>
        </div>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
          {albums.map((a) => (
            <button type="button" onClick={() => toast(`${a.title}: ${a.count} photos. Album detail is coming soon.`)}
              key={a.id}
              className="group relative aspect-[4/3] min-w-[240px] overflow-hidden rounded-[1.4rem] bg-ink"
            >
              <Image
                src={a.coverUrl}
                alt={`${a.title} album cover`}
                fill
                sizes="240px"
                className="object-cover opacity-80 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-serif text-2xl">{a.title}</h3>
                <p className="text-xs text-white/55">{a.count} photos</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section ref={momentsRef} className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">All moments</h2>
          <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(value => !value)} className={`flex items-center gap-1 text-sm font-bold ${favoritesOnly ? "text-wine" : "text-ink/55"}`}>
            <Heart className="h-4 w-4" /> Favorites
          </button>
        </div>
        {loading ? <div className="mt-5"><GalleryGridSkeleton /></div> : shownImages.length===0?<div className="mt-5"><EmptyState title="Your gallery is waiting" description="Photos you add to memories will appear here automatically." actionLabel="Add a memory" actionHref="/memories/new"/></div>:<div className={view === "grid" ? "mt-5 columns-2 gap-3 md:columns-3 xl:columns-4" : "mx-auto mt-5 max-w-3xl space-y-4"}>
          {shownImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setLightbox(src)}
              className="focus-ring group relative mb-3 block w-full overflow-hidden rounded-[1.1rem] bg-ink"
              style={{
                aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3",
              }}
            >
              <Image
                src={src}
                alt={`Shared gallery memory ${i + 1}`}
                fill
                sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-80"
              />
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 p-4 pt-12 text-left text-xs font-bold text-white transition group-hover:translate-y-0">
                Open memory
              </span>
            </button>
          ))}
        </div>}
      </section>
      {lightbox && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[150] grid place-items-center bg-black/80 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) setLightbox(null); }}><div className="relative h-[80vh] w-full max-w-5xl"><Image src={lightbox} alt="Selected shared memory" fill sizes="100vw" className="object-contain"/><button type="button" aria-label="Close lightbox" onClick={() => setLightbox(null)} className="focus-ring absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white text-ink"><X/></button></div></div>}
    </div>
  );
}
