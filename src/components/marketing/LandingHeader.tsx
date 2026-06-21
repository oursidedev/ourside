"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { appUrl } from "@/config/brand";
import { Bilingual } from "@/components/Bilingual";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { PremiumButton } from "@/components/ui/PremiumButton";

const links = [
  { href: "#about", en: "What is Ourside?", tr: "Ourside nedir?" },
  { href: "#features", en: "Features", tr: "Özellikler" },
  { href: "#story", en: "Timeline", tr: "Zaman çizelgesi" },
  { href: "#pricing", en: "Pricing", tr: "Fiyatlandırma" },
] as const;

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Keep menu state inside the marketing header; app navigation remains isolated.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    closeButton.current?.focus();
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  function keepFocusInside(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") || []);
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return <>
    <nav className="relative z-[80] mx-auto flex h-20 max-w-7xl items-center justify-between sm:h-24" aria-label="Main navigation">
      <Logo />
      <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
        {links.map((link) => <a key={link.href} href={link.href} className="focus-ring rounded-md py-2 transition-opacity hover:opacity-60"><Bilingual en={link.en} tr={link.tr} /></a>)}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher compact />
        <Link href={appUrl("/login")} className="focus-ring hidden rounded-md py-2 text-sm font-bold md:block"><Bilingual en="Log in" tr="Giriş yap" /></Link>
        <PremiumButton href={appUrl("/signup")} className="hidden md:inline-flex"><Bilingual en="Create your Ourside" tr="Ourside'ınızı oluşturun" /></PremiumButton>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open} aria-controls="mobile-marketing-menu" className="focus-ring grid h-11 w-11 place-items-center rounded-full border bg-paper md:hidden"><Menu className="h-5 w-5" /></button>
      </div>
    </nav>
    <AnimatePresence>
      {open && <motion.div id="mobile-marketing-menu" className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>
        <div aria-hidden="true" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/35 backdrop-blur-sm" />
        <motion.div ref={panel} onKeyDown={keepFocusInside} initial={reducedMotion ? false : { x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: .24, ease: "easeOut" }} className="absolute inset-y-0 right-0 flex w-[min(88vw,400px)] flex-col border-l bg-paper p-5 shadow-warm">
          <div className="flex items-center justify-between"><Logo /><button ref={closeButton} type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu" className="focus-ring grid h-11 w-11 place-items-center rounded-full border"><X className="h-5 w-5" /></button></div>
          <div className="mt-10 flex flex-col border-y py-3">{links.map((link, index) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="focus-ring flex min-h-14 items-center justify-between rounded-xl px-3 font-serif text-2xl hover:bg-cream"><Bilingual en={link.en} tr={link.tr} /><span className="font-sans text-xs text-ink/35">0{index + 1}</span></a>)}</div>
          <div className="mt-auto grid gap-3 pb-[max(0px,env(safe-area-inset-bottom))]"><PremiumButton href={appUrl("/signup")} onClick={() => setOpen(false)} className="w-full"><Bilingual en="Create your Ourside" tr="Ourside'ınızı oluşturun" /></PremiumButton><PremiumButton href={appUrl("/login")} onClick={() => setOpen(false)} variant="secondary" className="w-full"><Bilingual en="Log in" tr="Giriş yap" /></PremiumButton><p className="text-center text-xs leading-5 text-ink/45"><Bilingual en="A private space made only for two." tr="Yalnızca iki kişi için özel bir alan." /></p></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </>;
}
