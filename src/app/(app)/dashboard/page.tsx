"use client";

import { CalendarDays, Heart, LockKeyhole, Plus, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MemoryCard } from "@/components/MemoryCard";
import { FutureLetterCard } from "@/components/FutureLetterCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { memories } from "@/data/mock";
import { Bilingual } from "@/components/Bilingual";
import { useCoupleAccess } from "@/features/couples/CoupleAccessProvider";
import { useLocale } from "@/i18n/LocaleProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { liveMemoryService } from "@/features/memories/memory.supabase";
import { liveLetterService } from "@/features/letters/letter.supabase";
import { liveBucketListService } from "@/features/bucket-list/bucket-list.supabase";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { BucketListItem, Letter, Memory } from "@/types/database";
import { DashboardSkeleton } from "@/components/shared/loading/Skeletons";
export default function Dashboard() {
  const { state, loading } = useCoupleAccess();
  const { locale } = useLocale();
  const tr = locale === "tr";
  const { toast } = useToast();
  const [dailyAnswer, setDailyAnswer] = useState("");
  const [answerSaved, setAnswerSaved] = useState(false);
  const [recentMemories,setRecentMemories]=useState<Memory[]>([]);
  const [sharedLetters,setSharedLetters]=useState<Letter[]>([]);
  const [sharedPlans,setSharedPlans]=useState<BucketListItem[]>([]);
  const loadShared=useCallback(async()=>{if(!state?.ok||!state.complete)return;const results=await Promise.allSettled([liveMemoryService.list(),liveLetterService.list(),liveBucketListService.list()]);if(results[0].status==="fulfilled")setRecentMemories(results[0].value);if(results[1].status==="fulfilled")setSharedLetters(results[1].value);if(results[2].status==="fulfilled")setSharedPlans(results[2].value);},[state]);
  useEffect(()=>{void loadShared();const stops=[subscribeToTable("memories",()=>void loadShared()),subscribeToTable("letters",()=>void loadShared()),subscribeToTable("bucket_list_items",()=>void loadShared())];return()=>stops.forEach(stop=>stop());},[loadShared]);

  if (loading) return <DashboardSkeleton />;
  if (!state?.ok) return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{state?.message || "Unable to load your Ourside."}</div>;
  if (!state.complete) return <section className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-paper via-[#fbf4f0] to-[#f0e3ea] p-7 shadow-warm sm:p-12"><div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-rose/15 blur-3xl" /><span className="relative grid h-14 w-14 place-items-center rounded-full bg-wine/10 text-wine"><LockKeyhole /></span><p className="eyebrow relative mt-7">{tr ? "İki kişilik özel alan" : "A private space for two"}</p><h1 className="relative mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">{state.hasCouple ? (tr ? `${state.currentUserName}, partnerinizi davet edin.` : `${state.currentUserName}, invite your partner.`) : (tr ? "Ourside’ınızı oluşturarak başlayın." : "Start by creating your Ourside.")}</h1><p className="relative mt-5 max-w-xl leading-7 text-ink/55">{tr ? "Anılar, galeri, gelecek mektupları ve ortak planlar partneriniz katıldığında açılır. Bu alana yalnızca ikiniz erişebilirsiniz." : "Memories, gallery, future letters and shared plans unlock when your partner joins. Only the two of you can access this space."}</p><PremiumButton href={state.hasCouple ? "/settings" : "/onboarding"} className="relative mt-8"><UserPlus className="h-4 w-4" />{state.hasCouple ? (tr ? "Partner ekle" : "Add partner") : (tr ? "Ourside oluştur" : "Create Ourside")}</PremiumButton></section>;

  const coupleNames = state.memberNames.join(" & ");
  const daysTogether = state.startDate ? Math.max(0, Math.floor((Date.now() - new Date(state.startDate).getTime()) / 86400000)) : 0;
  return (
    <div>
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-wine via-[#8e4d56] to-[#b88484] p-6 text-white shadow-warm sm:p-10">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-[.25em] text-white/55">
          <Bilingual en="Our private universe" tr="Özel evrenimiz" />
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-6xl">
          {coupleNames}
        </h1>
        <p className="mt-2 text-white/65">{daysTogether} <Bilingual en="days of us." tr="gündür biz." /></p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PremiumButton
            href="/memories/new"
            className="bg-white text-wine shadow-none hover:bg-[#fff7f4]"
          >
            <Plus className="h-4 w-4" /> <Bilingual en="Add a memory" tr="Anı ekle" />
          </PremiumButton>
          <div className="flex items-center gap-2 rounded-full border border-white/20 px-4 text-sm">
            <Heart className="h-4 w-4 animate-pulse" fill="currentColor" />{" "}
            {tr ? "Hâlâ birbirimizi seçiyoruz" : "Still choosing us"}
          </div>
        </div>
        <div className="mt-10 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <span className="text-xs text-white/55">{tr ? "Sıradaki dönüm noktası" : "Next milestone"}</span>
            <strong className="mt-1 block font-serif text-xl">
              {tr ? "Birlikte 500 gün" : "500 days together"}
            </strong>
            <span className="text-xs text-white/50">{tr ? "73 gün sonra" : "in 73 days"}</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <span className="text-xs text-white/55">{tr ? "Yaklaşan" : "Coming up"}</span>
            <strong className="mt-1 block font-serif text-xl">
              {tr ? "Sıradaki özel tarihiniz" : "Your next special date"}
            </strong>
            <span className="text-xs text-white/50">{tr ? "16 Ağustos" : "August 16"}</span>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <span className="text-xs text-white/55">{tr ? "Bu ay" : "This month"}</span>
            <strong className="mt-1 block font-serif text-xl">
              {tr ? "12 anı kaydedildi" : "12 moments saved"}
            </strong>
            <span className="text-xs text-white/50">
              {tr ? "Şimdiye kadarki en dolu ayınız" : "Your fullest month yet"}
            </span>
          </div>
        </div>
      </section>
      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="eyebrow">{tr ? "Son zamanlarda, birlikte" : "Lately, with you"}</p>
          <h2 className="mt-2 font-serif text-3xl"><Bilingual en="Recent memories" tr="Son anılar" /></h2>
        </div>
        <Link href="/memories" className="text-sm font-bold text-wine">
          <Bilingual en="View all" tr="Tümünü gör" />
        </Link>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">{recentMemories.length?recentMemories.slice(0,2).map((memory,index)=><MemoryCard key={memory.id} memory={memory} large={index===0}/>):<div className="col-span-full rounded-2xl border border-dashed bg-paper p-8 text-center text-sm text-ink/50">Your first shared memory will appear here.</div>}</div>
      <div className="mt-10 grid gap-5 xl:grid-cols-3">
        <section className="overflow-hidden rounded-[1.5rem] border bg-paper shadow-card xl:col-span-2">
          <div className="grid md:grid-cols-2">
            <div
              className="relative min-h-56 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(to top,rgba(0,0,0,.4),transparent),url(${memories[2].imageUrl})`,
              }}
            >
              <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-wine">
                {tr ? "Bugün, bir yıl önce" : "One year ago today"}
              </span>
            </div>
            <div className="p-7">
              <CalendarDays className="text-rose" />
              <h2 className="mt-5 font-serif text-3xl">
                {tr ? "Birlikte ilk gün batımımız." : "Our first sunset together."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink/55">
                {tr ? "Gökyüzünün bizi kutluyor gibi göründüğünü söyledin. Bunu not etmemiş gibi yaptım." : "You said the sky looked like it was celebrating us. I pretended not to write that down."}
              </p>
              <Link
                href="/memories/3"
                className="mt-6 inline-block text-sm font-bold text-wine"
              >
                {tr ? "Bu anıyı aç →" : "Open this memory →"}
              </Link>
            </div>
          </div>
        </section>
        <section className="rounded-[1.5rem] border bg-paper p-7 shadow-card">
          <div className="flex items-center justify-between">
            <Sparkles className="text-rose" />
            <span className="eyebrow">{tr ? "İkiniz de yanıtlayınca açılır" : "Both answer to reveal"}</span>
          </div>
          <h2 className="mt-5 font-serif text-2xl">
            {tr ? "Bugün partneriniz sayesinde sizi ne gülümsetti?" : "What made you smile because of your partner today?"}
          </h2>
          <textarea
            aria-label="Your private answer"
            placeholder={tr ? "Yanıtınızı özel olarak yazın…" : "Write your answer privately…"}
            className="focus-ring mt-5 min-h-24 w-full resize-none rounded-xl border bg-cream p-3 text-sm"
            value={dailyAnswer}
            onChange={(event) => { setDailyAnswer(event.target.value); setAnswerSaved(false); }}
          />
          <PremiumButton type="button" disabled={!dailyAnswer.trim() || answerSaved} onClick={() => { setAnswerSaved(true); toast(tr ? "Yanıtınız partneriniz yanıtlayana kadar gizli tutulacak." : "Your answer is sealed until your partner responds.", "success"); }} className="mt-3 w-full">{answerSaved ? (tr ? "Yanıt mühürlendi" : "Answer sealed") : (tr ? "Yanıtımı mühürle" : "Seal my answer")}</PremiumButton>
        </section>
      </div>
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{tr ? "Sizi bekleyen kelimeler" : "Words waiting for you"}</p>
            <h2 className="mt-2 font-serif text-3xl"><Bilingual en="Open soon" tr="Yakında açılacak" /></h2>
          </div>
          <Link href="/vault" className="text-sm font-bold text-wine">
            {tr ? "Kasaya git" : "Visit the vault"}
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sharedLetters.slice(0, 2).map((l) => (
            <FutureLetterCard key={l.id} letter={l} />
          ))}
        </div>
      </section>
      <section className="mt-10 rounded-[1.5rem] border bg-paper p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">{tr ? "Birlikte kurulan gelecek" : "A future made together"}</p>
            <h2 className="mt-2 font-serif text-3xl"><Bilingual en="Shared plans" tr="Ortak planlar" /></h2>
          </div>
          <span className="font-serif text-3xl text-wine">20%</span>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-wine/10">
          <div className="h-full w-1/5 rounded-full bg-wine" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {sharedPlans.slice(0, 4).map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-3 rounded-xl bg-cream p-4"
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border ${i.completed ? "bg-wine text-white" : ""}`}
              >
                {i.completed ? "✓" : ""}
              </span>
              <span className={i.completed ? "line-through opacity-50" : ""}>
                {i.title}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
