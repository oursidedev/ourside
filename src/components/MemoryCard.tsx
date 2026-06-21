"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import type { Memory } from "@/types/database";
import { cn } from "@/lib/utils/cn";

export function MemoryCard({ memory, large = false }: { memory: Memory; large?: boolean }) {
  return <motion.article whileHover={{ y: -5 }} transition={{ duration: .25 }} className={cn("group overflow-hidden rounded-[1.5rem] border bg-paper shadow-card", large && "md:col-span-2")}>
    <Link href={`/memories/${memory.id}`} className="focus-ring block">
      {memory.imageUrl ? <div className={cn("relative overflow-hidden", large ? "aspect-[16/9]" : "aspect-[4/3]")}>
        {/* Signed URLs are already access-scoped. Bypassing the optimizer also avoids caching an expired signature. */}
        <Image src={memory.imageUrl} alt={memory.title} fill unoptimized className="object-cover transition duration-700 group-hover:scale-[1.035]" sizes="(max-width:768px) 100vw, 40vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent" />
        <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">{new Date(memory.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
        {memory.favorite && <Heart className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/85 p-2 text-wine" fill="currentColor" />}
      </div> : <div className="paper-grid flex aspect-[4/2] items-center justify-center px-8 font-serif text-2xl italic text-wine/60">“{memory.note}”</div>}
      <div className="p-5"><div className="mb-2 flex items-start justify-between gap-4"><h3 className="font-serif text-xl font-semibold">{memory.title}</h3><span className="shrink-0 text-xs text-ink/45">by {memory.author}</span></div><p className="line-clamp-2 text-sm leading-6 text-ink/60">{memory.note}</p>{memory.location && <div className="mt-4 flex items-center gap-1.5 text-xs text-wine/70"><MapPin className="h-3.5 w-3.5" />{memory.location}</div>}</div>
    </Link>
  </motion.article>;
}
