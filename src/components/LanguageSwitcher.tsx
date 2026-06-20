"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { localeMeta, locales, type Locale } from "@/i18n";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
export function LanguageSwitcher({
  compact = false,
  inverted = false,
}: {
  compact?: boolean;
  inverted?: boolean;
}) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const choose = (value: Locale) => {
    setLocale(value);
    setOpen(false);
  };
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={t("common.language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((x) => !x)}
        className={cn(
          "focus-ring flex min-h-11 items-center gap-2 rounded-full border px-3 text-xs font-bold transition hover:-translate-y-px",
          inverted
            ? "border-white/20 bg-white/10 text-white"
            : "border-ink/10 bg-paper/80 text-ink shadow-sm hover:bg-paper",
        )}
      >
        <Globe2 className="h-4 w-4 text-rose" />
        <span>
          {compact ? localeMeta[locale].short : localeMeta[locale].label}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-45 transition duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label={t("common.language")}
            initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{
              duration: reduce ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute right-0 top-[calc(100%+.6rem)] z-[70] w-56 origin-top-right overflow-hidden rounded-2xl border bg-paper/95 p-2 text-ink shadow-warm backdrop-blur-xl"
          >
            <div className="px-3 pb-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-ink/35">
                {t("common.language")}
              </p>
            </div>
            {locales.filter((code) => code === "en" || code === "tr").map((code, index) => (
              <motion.button
                key={code}
                role="option"
                aria-selected={locale === code}
                onClick={() => choose(code)}
                initial={reduce ? false : { opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: reduce ? 0 : index * 0.025,
                  duration: 0.18,
                }}
                className={cn(
                  "focus-ring flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition hover:bg-wine/5",
                  locale === code && "bg-wine/8 text-wine",
                )}
              >
                <span className="text-base" aria-hidden>
                  {localeMeta[code].flag}
                </span>
                <span className="flex-1 font-semibold">
                  {localeMeta[code].label}
                </span>
                <span className="text-[10px] font-bold text-ink/35">
                  {localeMeta[code].short}
                </span>
                {locale === code && <Check className="h-4 w-4" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
