"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, LoaderCircle, MapPin, Smile, Type } from "lucide-react";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Bilingual } from "@/components/Bilingual";
import type { PreparedImage } from "@/features/media/media.types";
import { createMemoryWithMedia } from "@/features/memories/memory.upload";
import { useBillingPlan } from "@/features/billing/useBillingPlan";
import { useAppDialog } from "@/components/shared/dialogs/DialogProvider";

export default function NewMemory() {
  const router = useRouter(); const { mediaPlan, planDetails, limits, usage } = useBillingPlan(); const { info } = useAppDialog(); const [images, setImages] = useState<PreparedImage[]>([]); const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; const memoryLimit=limits?.memories;const memoryUsage=usage.memories||0;if(memoryLimit!=null&&memoryUsage>=memoryLimit){await info({title:"Memory limit reached",description:`You have used ${memoryUsage} / ${memoryLimit} memories on the ${planDetails?.name||"current"} plan. Upgrade to create more memories.`,confirmLabel:"View upgrade options"});router.push("/settings");return;} const form = new FormData(event.currentTarget); setBusy(true); setError(""); setProgress(1);
    try { await createMemoryWithMedia({ title: String(form.get("title") || ""), description: String(form.get("description") || ""), memoryDate: String(form.get("date") || ""), location: String(form.get("location") || ""), mood: String(form.get("mood") || ""), images, onProgress: setProgress }); router.push("/memories"); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The memory could not be saved."); setBusy(false); }
  }
  return <div className="mx-auto max-w-3xl">
    <p className="eyebrow"><Bilingual en="Keep this moment" tr="Bu anı sakla" /></p><h1 className="mt-2 font-serif text-4xl sm:text-5xl"><Bilingual en="Add a new memory" tr="Yeni bir anı ekle" /></h1><p className="mt-2 text-sm text-ink/50"><Bilingual en="It doesn’t have to be a big day to be worth remembering." tr="Hatırlamaya değer olması için büyük bir gün olması gerekmez." /></p>
    <form onSubmit={submit} className="mt-8 space-y-6 rounded-[2rem] border bg-paper p-5 shadow-card sm:p-8">
      <ImageUploadDropzone plan={mediaPlan} onPreparedChange={setImages} />
      <label className="block text-sm font-bold"><Bilingual en="What would you call this moment?" tr="Bu ana ne isim verirdin?" /><div className="relative mt-2"><Type className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" /><input required name="title" maxLength={160} className="focus-ring h-13 w-full rounded-xl border bg-cream pl-11 pr-4" placeholder="The afternoon we got lost" /></div></label>
      <label className="block text-sm font-bold"><Bilingual en="Tell the story" tr="Hikâyeyi anlat" /><textarea name="description" maxLength={5000} className="focus-ring mt-2 min-h-32 w-full rounded-xl border bg-cream p-4" placeholder="The little details you’ll want to remember…" /></label>
      <div className="grid gap-4 sm:grid-cols-3">{[[Calendar,"Date","date","date"],[MapPin,"Place","text","location"],[Smile,"Mood","text","mood"]].map(([Icon,label,type,name]) => <label key={name as string} className="text-sm font-bold">{label as string}<div className="relative mt-2"><Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" /><input required={name === "date"} name={name as string} type={type as string} defaultValue={name === "date" ? new Date().toISOString().slice(0,10) : undefined} className="focus-ring h-12 w-full rounded-xl border bg-cream pl-10 pr-3 text-sm" /></div></label>)}</div>
      {busy && <div className="space-y-2" aria-live="polite"><p className="flex items-center gap-2 text-sm font-semibold text-wine"><LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />Saving privately · {progress}%</p><div className="h-1.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-wine transition-[width]" style={{width:`${progress}%`}} /></div></div>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div className="flex justify-end gap-3 border-t pt-6"><PremiumButton href="/memories" variant="ghost">Cancel</PremiumButton><PremiumButton type="submit" disabled={busy} ariaBusy={busy}>Save this memory</PremiumButton></div>
    </form>
  </div>;
}
