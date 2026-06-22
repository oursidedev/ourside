"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  CalendarHeart,
  Check,
  Eye,
  GalleryHorizontalEnd,
  Heart,
  Home,
  Info,
  Library,
  LockKeyhole,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { marketingImages } from "@/data/marketing-images";
import { appUrl, marketingUrl } from "@/config/brand";

type DemoTab =
  | "home"
  | "memories"
  | "gallery"
  | "vault"
  | "milestones"
  | "plans";
type DemoMemory = {
  id: string;
  title: string;
  note: string;
  date: string;
  image?: (typeof marketingImages)[number];
  temporary?: boolean;
};

const initialMemories: DemoMemory[] = [
  {
    id: "demo-coffee",
    title: "The coffee shop we kept returning to",
    note: "A small ritual that quietly became ours.",
    date: "April 18, 2025",
    image: marketingImages[1],
  },
  {
    id: "demo-trip",
    title: "Our first weekend trip",
    note: "No itinerary, one shared playlist, and the wrong train.",
    date: "November 2, 2025",
    image: marketingImages[3],
  },
  {
    id: "demo-home",
    title: "The day we moved in",
    note: "Keys on the table and boxes in every room.",
    date: "February 14, 2026",
    image: marketingImages[4],
  },
];

const tabs: Array<[DemoTab, string, typeof Home]> = [
  ["home", "Overview", Home],
  ["memories", "Memories", Library],
  ["gallery", "Gallery", GalleryHorizontalEnd],
  ["vault", "Vault", LockKeyhole],
  ["milestones", "Milestones", CalendarHeart],
  ["plans", "Plans", Target],
];

/**
 * Public portfolio sandbox.
 *
 * Demo mutations live only in React memory. Do not add Supabase clients,
 * fetch calls, localStorage, cookies, or file upload adapters to this tree.
 * Reloading or leaving the page intentionally destroys every visitor input.
 */
export function DemoDashboard() {
  const [tab, setTab] = useState<DemoTab>("home");
  const [memories, setMemories] = useState(initialMemories);
  const [composerOpen, setComposerOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [toast, setToast] = useState("");

  function addMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const note = String(data.get("note") || "").trim();
    if (!title) return;
    setMemories((current) => [
      {
        id: `temporary-${Date.now()}`,
        title,
        note,
        date: "Just now · demo only",
        temporary: true,
      },
      ...current,
    ]);
    event.currentTarget.reset();
    setComposerOpen(false);
    setToast(
      "Added to this temporary preview. Refreshing the page removes it.",
    );
  }

  function resetDemo() {
    setMemories(initialMemories);
    setToast("Temporary demo changes were cleared.");
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-paper/90 p-6 backdrop-blur-xl md:flex">
        <Logo />
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#f2ded9] to-[#eee6f4] p-4">
          <div className="flex -space-x-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper bg-wine text-sm font-bold text-white">
              A
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-paper bg-rose text-sm font-bold text-white">
              M
            </span>
          </div>
          <p className="mt-3 font-bold">Alex & Morgan</p>
          <p className="text-xs text-ink/50">Fictional portfolio space</p>
        </div>
        <nav className="mt-7 space-y-1" aria-label="Demo sections">
          {tabs.map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              aria-current={tab === value ? "page" : undefined}
              className={`focus-ring flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${tab === value ? "bg-wine text-white shadow-md" : "text-ink/55 hover:bg-wine/5 hover:text-wine"}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border bg-cream p-4">
          <ShieldCheck className="h-5 w-5 text-wine" />
          <p className="mt-2 font-serif text-lg">Safe portfolio sandbox</p>
          <p className="mt-1 text-xs leading-5 text-ink/50">
            No account, database write, upload, cookie, or persistent storage is
            used.
          </p>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b bg-cream/90 px-4 backdrop-blur-xl md:px-8">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-ink/45">
              Interactive product walkthrough
            </p>
            <p className="font-serif text-lg">Ourside portfolio demo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetDemo}
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border bg-paper px-4 text-xs font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset demo</span>
            </button>
            <PremiumButton
              href={appUrl("/login")}
              variant="secondary"
              className="hidden sm:inline-flex"
            >
              Owner login
            </PremiumButton>
          </div>
        </header>
        {noticeOpen && (
          <section
            className="border-b border-amber-200 bg-amber-50/90 px-4 py-3 md:px-8"
            role="status"
          >
            <div className="mx-auto flex max-w-[1380px] items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
              <p className="flex-1 text-xs leading-5 text-amber-950">
                <strong>Temporary demonstration environment.</strong> Everything
                shown is fictional. Text you enter is held only in this page’s
                volatile memory, is never transmitted to Ourside or Supabase,
                and disappears when you refresh or close the page. File and
                media uploads are disabled.
              </p>
              <button
                type="button"
                onClick={() => setNoticeOpen(false)}
                aria-label="Dismiss demo notice"
                className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}
        <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-9">
          {toast && (
            <div
              role="status"
              className="mb-5 flex items-center justify-between rounded-xl border border-wine/15 bg-paper p-4 text-sm text-wine shadow-card"
            >
              <span>{toast}</span>
              <button
                type="button"
                onClick={() => setToast("")}
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {tab === "home" && (
            <Overview
              memories={memories}
              onAdd={() => setComposerOpen(true)}
              onTab={setTab}
            />
          )}
          {tab === "memories" && (
            <MemorySection
              memories={memories}
              onAdd={() => setComposerOpen(true)}
            />
          )}
          {tab === "gallery" && <GallerySection />}
          {tab === "vault" && (
            <VaultSection
              onTry={() =>
                setToast(
                  "Letter composing is a visual demo. No message was stored or sent.",
                )
              }
            />
          )}
          {tab === "milestones" && <MilestoneSection />}
          {tab === "plans" && (
            <PlansSection
              onTry={() =>
                setToast(
                  "Plan completion was previewed locally. No account data changed.",
                )
              }
            />
          )}
          <DemoDisclosure />
        </main>
      </div>
      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-2xl border bg-paper/95 p-1.5 shadow-warm backdrop-blur md:hidden"
        aria-label="Mobile demo navigation"
      >
        {tabs.map(([value, label, Icon]) => (
          <button
            type="button"
            key={value}
            onClick={() => setTab(value)}
            aria-label={label}
            aria-current={tab === value ? "page" : undefined}
            className={`focus-ring grid min-h-12 place-items-center rounded-xl ${tab === value ? "bg-wine text-white" : "text-ink/45"}`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[8px] font-bold">{label}</span>
          </button>
        ))}
      </nav>
      {composerOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-end bg-ink/40 p-3 backdrop-blur-sm sm:place-items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-composer-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setComposerOpen(false);
          }}
        >
          <form
            onSubmit={addMemory}
            className="w-full max-w-lg rounded-[1.75rem] border bg-paper p-6 shadow-warm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">Temporary interaction</p>
                <h2
                  id="demo-composer-title"
                  className="mt-2 font-serif text-3xl"
                >
                  Try adding a memory
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                aria-label="Close memory form"
                className="focus-ring grid h-10 w-10 place-items-center rounded-full border"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
              Text stays only in your current browser page and vanishes on
              refresh. Photo/file selection is intentionally unavailable.
            </div>
            <label className="mt-5 block text-sm font-bold">
              Memory title
              <input
                name="title"
                required
                maxLength={80}
                className="focus-ring mt-2 h-12 w-full rounded-xl border bg-cream px-4 font-normal"
                placeholder="A quiet Sunday morning"
              />
            </label>
            <label className="mt-4 block text-sm font-bold">
              Private note
              <textarea
                name="note"
                maxLength={240}
                className="focus-ring mt-2 min-h-28 w-full resize-none rounded-xl border bg-cream p-4 font-normal"
                placeholder="This is a temporary local preview…"
              />
            </label>
            <PremiumButton type="submit" className="mt-5 w-full">
              Add to temporary preview
            </PremiumButton>
          </form>
        </div>
      )}
    </div>
  );
}

function Overview({
  memories,
  onAdd,
  onTab,
}: {
  memories: DemoMemory[];
  onAdd: () => void;
  onTab: (tab: DemoTab) => void;
}) {
  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-wine via-[#8e4d56] to-[#b88484] p-6 text-white shadow-warm sm:p-10">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <p className="relative text-xs font-bold uppercase tracking-[.25em] text-white/55">
          A fictional private universe
        </p>
        <h1 className="relative mt-3 font-serif text-4xl sm:text-6xl">
          Alex & Morgan
        </h1>
        <p className="relative mt-2 text-white/65">
          427 days together · portfolio demonstration
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAdd}
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-wine"
          >
            <Plus className="h-4 w-4" />
            Try adding a memory
          </button>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 text-sm">
            <Heart className="h-4 w-4" fill="currentColor" />
            Still choosing us
          </span>
        </div>
        <div className="relative mt-10 grid gap-2 sm:grid-cols-3">
          <Stat
            label="Next milestone"
            value="Second anniversary"
            detail="October 12"
          />
          <Stat label="Open soon" value="A future letter" detail="143 days" />
          <Stat
            label="This month"
            value={`${memories.filter((item) => item.temporary).length} demo additions`}
            detail="Resets on refresh"
          />
        </div>
      </section>
      <SectionTitle
        eyebrow="Lately, together"
        title="Recent memories"
        action="View timeline"
        onAction={() => onTab("memories")}
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {memories.slice(0, 3).map((memory) => (
          <DemoMemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <PreviewCard
          icon={LockKeyhole}
          title="A letter for our next anniversary"
          text="Sealed today and waiting for another chapter."
          action="Explore the vault"
          onAction={() => onTab("vault")}
        />
        <PreviewCard
          icon={Target}
          title="Shared plans · 50% complete"
          text="Visit Lisbon, recreate a first date, make a photo book."
          action="Explore plans"
          onAction={() => onTab("plans")}
        />
      </div>
    </>
  );
}
function MemorySection({
  memories,
  onAdd,
}: {
  memories: DemoMemory[];
  onAdd: () => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="Demo timeline"
        title="Memories"
        text="Explore fictional examples or add a temporary text-only card. Nothing leaves this page."
        action="Try adding a memory"
        onAction={onAdd}
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {memories.map((memory) => (
          <DemoMemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
    </>
  );
}
function GallerySection() {
  return (
    <>
      <PageHeading
        eyebrow="Fictional media"
        title="Private gallery"
        text="These editorial demo images are bundled public assets. Visitor media upload is disabled to prevent collection of personal files."
      />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {marketingImages.slice(1, 7).map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl border bg-paper shadow-card ${index === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
          >
            <Image
              src={image}
              alt={`Fictional gallery example ${index + 1}`}
              fill
              sizes="(max-width: 767px) 50vw, 30vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}
function VaultSection({ onTry }: { onTry: () => void }) {
  return (
    <>
      <PageHeading
        eyebrow="Future letters"
        title="Words waiting for later"
        text="Letter contents below are fictional UI examples. The public demo never accepts or transmits private messages."
        action="Preview compose action"
        onAction={onTry}
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <LetterCard
          title="For our next beginning"
          date="Opens October 12, 2027"
          days="480"
        />
        <LetterCard
          title="Read this when you need a reminder"
          date="Opens tomorrow"
          days="1"
        />
      </div>
    </>
  );
}
function MilestoneSection() {
  return (
    <>
      <PageHeading
        eyebrow="Relationship timeline"
        title="Milestones"
        text="A static portfolio preview of meaningful dates. No real relationship information is requested."
      />
      <div className="mt-10 space-y-4">
        {[
          ["Apr 18, 2025", "First date"],
          ["Nov 02, 2025", "First weekend trip"],
          ["Feb 14, 2026", "Moved in together"],
          ["Oct 12, 2026", "First anniversary"],
        ].map(([date, title], index) => (
          <div
            key={title}
            className="flex gap-5 rounded-2xl border bg-paper p-5 shadow-card"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wine text-sm font-bold text-white">
              {index + 1}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-wine">
                {date}
              </p>
              <h2 className="mt-1 font-serif text-2xl">{title}</h2>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function PlansSection({ onTry }: { onTry: () => void }) {
  return (
    <>
      <PageHeading
        eyebrow="Shared dreams"
        title="Plans for later"
        text="These sample goals demonstrate the bucket-list experience without creating a user record."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          "Visit Lisbon together",
          "Recreate our first date",
          "Watch the sunrise by the sea",
          "Make a printed photo book",
        ].map((plan, index) => (
          <button
            type="button"
            key={plan}
            onClick={onTry}
            className="focus-ring flex min-h-20 items-center gap-4 rounded-2xl border bg-paper p-5 text-left shadow-card transition hover:-translate-y-0.5"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full border ${index > 1 ? "bg-wine text-white" : ""}`}
            >
              {index > 1 && <Check className="h-4 w-4" />}
            </span>
            <span
              className={index > 1 ? "line-through opacity-50" : "font-bold"}
            >
              {plan}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
function DemoDisclosure() {
  return (
    <section
      className="mt-12 rounded-[1.75rem] border bg-paper p-6 shadow-card sm:p-8"
      aria-labelledby="demo-privacy-title"
    >
      <div className="flex items-start gap-4">
        <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-wine" />
        <div>
          <p className="eyebrow">Privacy and legal notice</p>
          <h2 id="demo-privacy-title" className="mt-2 font-serif text-3xl">
            What happens to information entered here?
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-ink/60">
            <p>
              This is a public, non-production portfolio sandbox. It does not
              create an account, identify a visitor, connect to a couple space,
              or provide a private storage service.
            </p>
            <p>
              Text entered into demo controls is retained only in volatile React
              component memory. It is not intentionally sent to Supabase, Vercel
              APIs, email providers, analytics payloads, cookies, localStorage,
              or sessionStorage. Refreshing, closing, or navigating away from
              the page removes it.
            </p>
            <p>
              Do not enter real names, contact details, passwords, health
              information, intimate content, copyrighted private media, or any
              other personal/confidential information. File uploads, camera
              access, microphone access, sharing, and downloads are disabled in
              the public demo.
            </p>
            <p>
              Fictional names and editorial images are used solely to
              demonstrate product design. The demo is provided for portfolio
              evaluation and is not an active consumer service, contractual
              data-storage product, or guarantee of future availability.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-wine">
            <Link href={marketingUrl("/privacy")}>Privacy policy</Link>
            <Link href={marketingUrl("/terms")}>Terms</Link>
            <Link href={marketingUrl("/contact")}>Contact</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
function DemoMemoryCard({ memory }: { memory: DemoMemory }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border bg-paper shadow-card">
      {memory.image ? (
        <div className="relative aspect-[4/3]">
          <Image
            src={memory.image}
            alt="Fictional portfolio memory"
            fill
            sizes="(max-width: 767px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-[#f2ded9] to-[#eee6f4]">
          <Sparkles className="text-wine" />
        </div>
      )}
      <div className="p-5">
        {memory.temporary && (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-900">
            Temporary · local only
          </span>
        )}
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-wine">
          {memory.date}
        </p>
        <h3 className="mt-2 font-serif text-2xl">{memory.title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/55">{memory.note}</p>
      </div>
    </article>
  );
}
function PageHeading({
  eyebrow,
  title,
  text,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink/55">{text}</p>
      </div>
      {action && onAction && (
        <PremiumButton type="button" onClick={onAction}>
          {action}
        </PremiumButton>
      )}
    </div>
  );
}
function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mt-10 flex items-end justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="focus-ring rounded-md text-sm font-bold text-wine"
      >
        {action}
      </button>
    </div>
  );
}
function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
      <span className="text-xs text-white/55">{label}</span>
      <strong className="mt-1 block font-serif text-xl">{value}</strong>
      <span className="text-xs text-white/50">{detail}</span>
    </div>
  );
}
function PreviewCard({
  icon: Icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: typeof Eye;
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="rounded-[1.5rem] border bg-paper p-7 shadow-card">
      <Icon className="text-wine" />
      <h2 className="mt-5 font-serif text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/55">{text}</p>
      <button
        type="button"
        onClick={onAction}
        className="focus-ring mt-5 rounded-md text-sm font-bold text-wine"
      >
        {action} →
      </button>
    </section>
  );
}
function LetterCard({
  title,
  date,
  days,
}: {
  title: string;
  date: string;
  days: string;
}) {
  return (
    <article className="rounded-[1.75rem] border bg-gradient-to-br from-paper to-[#f1d9d5] p-7 shadow-warm">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-wine text-white">
        <LockKeyhole className="h-5 w-5" />
      </span>
      <p className="eyebrow mt-8">Fictional sealed letter</p>
      <h2 className="mt-2 font-serif text-3xl">{title}</h2>
      <p className="mt-3 text-sm text-ink/50">{date}</p>
      <div className="mt-7 rounded-xl bg-white/55 p-4 text-center">
        <strong className="font-serif text-3xl">{days}</strong>
        <span className="ml-2 text-xs uppercase tracking-wider text-ink/45">
          days
        </span>
      </div>
    </article>
  );
}
