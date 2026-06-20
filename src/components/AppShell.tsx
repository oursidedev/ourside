"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, GalleryHorizontalEnd, HeartHandshake, Home, Library, LockKeyhole, Plus, Settings2, Sparkles, UserPlus } from "lucide-react";
import { Logo } from "./Logo";
import { PremiumButton } from "./ui/PremiumButton";
import { MobileBottomNav } from "./MobileBottomNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import type { TranslationKey } from "@/i18n";
import { CoupleAccessProvider, useCoupleAccess } from "@/features/couples/CoupleAccessProvider";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

const nav: [TranslationKey, string, typeof Home, boolean][] = [
  ["nav.home", "/dashboard", Home, false], ["nav.memories", "/memories", Library, true],
  ["nav.gallery", "/gallery", GalleryHorizontalEnd, true], ["nav.vault", "/vault", LockKeyhole, true],
  ["nav.milestones", "/milestones", CalendarHeart, true], ["nav.plans", "/bucket-list", HeartHandshake, true],
  ["nav.settings", "/settings", Settings2, false],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return <CoupleAccessProvider><AppShellContent>{children}</AppShellContent></CoupleAccessProvider>;
}

function CoupleAvatarStack({ names, avatarUrls, loading }: { names: string[]; avatarUrls: Array<string | null>; loading: boolean }) {
  if (loading) return <div className="h-9 w-9 animate-pulse rounded-full bg-wine/10" />;
  return <div className="flex -space-x-2">{names.map((name, index) => {
    const initial = name.trim().charAt(0).toUpperCase();
    const avatarUrl = avatarUrls[index];
    return <div key={`${name}-${index}`} className={cn("relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-paper text-xs font-bold text-white", index ? "bg-rose" : "bg-wine")} title={name}>
      {avatarUrl ? <Image src={avatarUrl} alt={`${name} profil fotoğrafı`} fill unoptimized sizes="36px" className="object-cover" /> : initial}
    </div>;
  })}</div>;
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { t, locale } = useLocale();
  const { state, loading } = useCoupleAccess();
  const tr = locale === "tr";
  const ready = Boolean(state?.ok && state.complete);
  const lockedRoute = !loading && !ready && nav.some(([, href, , requiresPartner]) => requiresPartner && path.startsWith(href));
  const names = state?.ok ? state.memberNames : [];
  const avatarUrls = state?.ok ? state.memberAvatarUrls : [];
  const setupHref = state?.ok && state.hasCouple ? "/settings?invite=1" : "/onboarding";

  return <div className="min-h-screen bg-cream">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-paper/80 p-6 backdrop-blur-xl md:flex">
      <div className="flex items-center justify-between"><Logo /><LanguageSwitcher compact /></div>
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#f2ded9] to-[#eee6f4] p-3">
        <div className="flex items-center gap-3">
          <CoupleAvatarStack names={names} avatarUrls={avatarUrls} loading={loading} />
          <div className="min-w-0"><p className="truncate text-sm font-bold">{loading ? (tr ? "Yükleniyor…" : "Loading…") : names.join(" & ") || (tr ? "Profiliniz" : "Your profile")}</p><p className="text-[11px] text-ink/50">{ready ? t("common.privateSpace") : (tr ? "Partner bekleniyor" : "Waiting for partner")}</p></div>
        </div>
        {!loading && !ready && <Link href={setupHref} className="focus-ring mt-3 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-wine text-xs font-bold text-white"><UserPlus className="h-4 w-4" />{state?.ok && state.hasCouple ? (tr ? "Partner ekle" : "Add partner") : (tr ? "Ourside oluştur" : "Create Ourside")}</Link>}
      </div>
      <nav className="mt-8 space-y-1">{nav.map(([label, href, Icon, requiresPartner]) => {
        const locked = requiresPartner && !ready;
        return locked ? <span key={href} aria-disabled="true" className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink/25"><Icon className="h-[18px] w-[18px]" />{t(label)}<LockKeyhole className="ml-auto h-3.5 w-3.5" /></span> : <Link key={href} href={href} className={cn("focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink/55 transition hover:bg-wine/5 hover:text-wine", path === href && "bg-wine text-white shadow-md shadow-wine/15 hover:bg-wine hover:text-white")}><Icon className="h-[18px] w-[18px]" />{t(label)}</Link>;
      })}</nav>
      <div className="mt-auto rounded-2xl border bg-cream p-4"><Sparkles className="h-5 w-5 text-rose" /><p className="mt-2 font-serif text-lg">{ready ? (tr ? "Yalnızca ikinize ait." : "Kept between two.") : (tr ? "Hikâyeniz bir davetle başlar." : "Your story starts with an invitation.")}</p><p className="mt-1 text-xs leading-5 text-ink/50">{ready ? (tr ? "Anılarınızı sadece siz ve partneriniz görebilir." : "Only you and your partner can see your memories.") : (tr ? "Ortak özellikler partneriniz katıldığında açılır." : "Shared features unlock when your partner joins.")}</p></div>
    </aside>
    <div className="md:pl-64">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-cream/80 px-4 backdrop-blur-xl md:px-8">
        <div className="md:hidden"><Logo /></div>
        <div className="hidden md:block"><p className="text-xs text-ink/45">{new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date())}</p><p className="font-serif text-lg">{t("common.greeting")}</p></div>
        <div className="flex items-center gap-2"><div className="md:hidden"><LanguageSwitcher compact /></div><NotificationBell />{ready && <PremiumButton href="/memories/new" className="hidden sm:inline-flex"><Plus className="h-4 w-4" />{t("actions.addMemory")}</PremiumButton>}{!loading && !ready && <PremiumButton href={setupHref} className="hidden sm:inline-flex"><UserPlus className="h-4 w-4" />{tr ? "Partner ekle" : "Add partner"}</PremiumButton>}</div>
      </header>
      <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-9">{lockedRoute ? <section className="mx-auto mt-16 max-w-xl rounded-[2rem] border bg-paper p-8 text-center shadow-warm"><LockKeyhole className="mx-auto h-9 w-9 text-wine" /><p className="eyebrow mt-6">{tr ? "İki kişilik alan" : "A space for two"}</p><h1 className="mt-2 font-serif text-4xl">{tr ? "Bu özellik partneriniz katıldığında açılır." : "This feature unlocks when your partner joins."}</h1><p className="mt-3 text-sm leading-6 text-ink/55">{tr ? "Davet bağlantısını veya kısa kodu paylaşarak ortak alanınızı tamamlayın." : "Complete your shared space by sending the invite link or short code."}</p><PremiumButton href={setupHref} className="mt-6"><UserPlus className="h-4 w-4" />{tr ? "Partneri davet et" : "Invite partner"}</PremiumButton></section> : children}</main>
    </div>
    <MobileBottomNav partnerReady={ready} />
  </div>;
}
