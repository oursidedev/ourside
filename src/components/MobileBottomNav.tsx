"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, Library, LockKeyhole, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/i18n/LocaleProvider";
import type { TranslationKey } from "@/i18n";
const items: [TranslationKey, string, typeof Home, boolean][] = [["nav.home", "/dashboard", Home, false], ["nav.memories", "/memories", Library, true], ["nav.gallery", "/gallery", Images, true], ["nav.vault", "/vault", LockKeyhole, true], ["nav.settings", "/settings", UserRound, false]];
export function MobileBottomNav({ partnerReady }: { partnerReady: boolean }) { const path = usePathname(); const { t } = useLocale(); return <nav aria-label="Mobile navigation" className="safe-bottom fixed inset-x-3 bottom-2 z-50 flex items-center justify-around rounded-[1.4rem] border bg-paper/90 px-1 pt-2 shadow-warm backdrop-blur-xl md:hidden">{items.map(([label, href, Icon, requiresPartner]) => { const locked = requiresPartner && !partnerReady; return locked ? <span key={href} aria-disabled="true" className="flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold text-ink/20"><Icon className="h-5 w-5" />{t(label)}</span> : <Link key={href} href={href} className={cn("focus-ring flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold text-ink/45", path === href && "bg-wine/8 text-wine")}><Icon className="h-5 w-5" />{t(label)}</Link>; })}</nav>; }
