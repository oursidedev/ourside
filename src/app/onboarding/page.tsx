"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check, Heart, ImagePlus, Mail, Palette, PartyPopper } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { marketingImages as images } from "@/data/marketing-images";
import { coupleService } from "@/features/couples/couple.service";

const steps = [
  ["Welcome to Ourside", "A private universe for the story only you two can tell.", Heart],
  ["What should we call your space?", "Choose a private name for the world you share.", PartyPopper],
  ["When did your story begin?", "We’ll use this to celebrate the days and milestones between.", Heart],
  ["Choose your shared cover", "Pick a photo that feels like the beginning of your world.", ImagePlus],
  ["Bring your person in", "Send a private invitation to the person you share this with.", Mail],
  ["Make it feel like yours", "Choose the visual mood for your shared space.", Palette],
  ["Your Ourside is ready", "A beautiful blank page for everything ahead.", Check],
] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const [name, setName] = useState("Our Ourside");
  const [date, setDate] = useState("2025-04-18");
  const [style, setStyle] = useState<"warm" | "classic" | "minimal">("warm");
  const [coverName, setCoverName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const current = steps[step];
  const Icon = current[2];
  const finalStep = step === steps.length - 1;

  async function finishSetup() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    const result = await coupleService.createCoupleSpace({ name, startDate: date, style });
    setBusy(false);
    if (!result.ok) { setMessage(result.message); return; }
    router.push("/settings");
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-6">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />
        <span className="text-xs font-bold text-ink/45">Step {step + 1} of {steps.length}</span>
      </header>

      <div className="mx-auto mt-6 h-1 max-w-6xl overflow-hidden rounded-full bg-wine/10" aria-hidden="true">
        <div className="h-full rounded-full bg-wine transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-130px)] max-w-6xl items-center gap-12 py-10 lg:grid-cols-2">
        <section>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-wine/10 text-wine"><Icon /></span>
          <p className="eyebrow mt-8">{finalStep ? "Everything is in place" : "A little piece of your story"}</p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.04]">{current[0]}</h1>
          <p className="mt-5 max-w-lg leading-7 text-ink/55">{current[1]}</p>

          <div className="mt-8 max-w-lg">
            {step === 0 && <p className="font-serif text-xl italic text-wine">Our little world, kept forever.</p>}
            {step === 1 && <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Your name" className="focus-ring h-14 w-full rounded-xl border bg-paper px-4 text-lg" />}
            {step === 2 && <input value={date} onChange={(event) => setDate(event.target.value)} type="date" aria-label="Relationship start date" className="focus-ring h-14 w-full rounded-xl border bg-paper px-4 text-lg" />}
            {step === 3 && <label className="focus-within:focus-ring flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-paper p-5 text-center active:scale-[.99]"><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setCoverName(event.target.files?.[0]?.name || "")} /><ImagePlus className="text-wine" /><strong className="mt-3">{coverName || "Choose a favorite photo"}</strong><span className="text-sm text-ink/45">{coverName ? "Selected for your shared cover" : "JPG, PNG or WebP, up to 10 MB"}</span></label>}
            {step === 4 && <div className="rounded-2xl border bg-paper p-5 text-sm leading-6 text-ink/60"><Mail className="mb-3 h-5 w-5 text-wine" />After setup, create a private 7-day invite link from Settings. The link closes automatically when your partner joins.</div>}
            {step === 5 && <div className="grid grid-cols-3 gap-3">{([['Warm film','warm','#ead2cc'],['Quiet paper','classic','#f7f2e9'],['Soft dusk','minimal','#dcd4e8']] as const).map(([label, value, color]) => <button type="button" key={value} aria-pressed={style === value} onClick={() => setStyle(value)} className={`focus-ring aspect-square rounded-2xl border p-3 text-sm font-bold transition active:scale-95 ${style === value ? "ring-2 ring-wine ring-offset-2" : "hover:-translate-y-0.5"}`} style={{ background: color }}>{label}</button>)}</div>}
            {finalStep && <div className="flex items-center gap-2 text-sm font-bold text-wine"><Check className="h-4 w-4" /> Partner invite ready to send</div>}
          </div>

          <div className="mt-10 flex gap-3">
            <button type="button" disabled={step === 0} onClick={() => setStep((currentStep) => currentStep - 1)} aria-label="Previous step" className="focus-ring grid h-12 w-12 place-items-center rounded-full border disabled:opacity-30"><ArrowLeft /></button>
            <PremiumButton onClick={() => finalStep ? finishSetup() : setStep((currentStep) => currentStep + 1)} disabled={busy || (step === 1 && !name.trim())} ariaBusy={busy} className="min-w-40" type="button">{busy ? "Creating…" : finalStep ? "Create our space" : "Continue"}</PremiumButton>
          </div>
          {message && <p role="alert" className="mt-4 text-sm text-red-700">{message}</p>}
        </section>

        <aside className="relative mx-auto hidden w-full max-w-md lg:block">
          <div className="absolute inset-8 rounded-full bg-rose/20 blur-3xl" />
          <div className="relative rotate-2 overflow-hidden rounded-[2rem] border bg-paper p-4 shadow-warm">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]"><Image src={images[0]} alt="Shared space preview" fill priority sizes="448px" className="object-cover" /></div>
            <div className="p-4">
              <p className="eyebrow">Our Ourside</p>
              <h2 className="mt-2 font-serif text-3xl">{name || "Your Ourside"}</h2>
              <p className="mt-1 text-sm text-ink/50">Together since {new Date(date).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</p>
              <div className="mt-5 flex gap-2"><span className="rounded-full bg-wine px-3 py-1 text-xs text-white">Your story begins here</span><span className="rounded-full bg-rose/10 px-3 py-1 text-xs text-wine">Partner waiting</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
