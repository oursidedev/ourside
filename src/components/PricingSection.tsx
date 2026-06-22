"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { PremiumButton } from "./ui/PremiumButton";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  REGION_META,
  REGION_BY_LOCALE,
  type BillingRegion,
} from "@/features/billing/billing.pricing";
import type { BillingInterval } from "@/features/billing/billing.types";
import type { DynamicPlan } from "@/features/billing/plans.types";
import { FALLBACK_PUBLIC_PLANS } from "@/features/billing/plans.defaults";
import {
  formatDynamicPlanPrice,
  getPlanMarketingFeatures,
} from "@/features/billing/plan-display";
import { runtimeAppUrl } from "@/config/brand";
import { PRODUCT_STATUS } from "@/config/product-status";
export function PricingSection() {
  const { locale, t } = useLocale();
  const reduce = useReducedMotion();
  const [region, setRegion] = useState<BillingRegion>(REGION_BY_LOCALE[locale]);
  const [interval, setInterval] = useState<BillingInterval>("yearly");
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [plans, setPlans] = useState<DynamicPlan[]>(FALLBACK_PUBLIC_PLANS);
  useEffect(() => setRegion(REGION_BY_LOCALE[locale]), [locale]);
  useEffect(() => {
    fetch("/api/public/plans", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.plans?.length)
          setPlans(
            data.plans.map((plan: DynamicPlan) => ({ ...plan, id: plan.slug })),
          );
      });
  }, []);
  function purchase(plan: DynamicPlan) {
    if (!PRODUCT_STATUS.publicSignupEnabled) {
      window.location.assign("/#case-study");
      return;
    }
    if (plan.isFree) {
      window.location.assign(runtimeAppUrl("/signup"));
      return;
    }
    setChecking(plan.slug);
    const period =
      plan.lifetimePrice != null && plan.monthlyPrice == null
        ? "lifetime"
        : interval;
    window.location.assign(
      runtimeAppUrl(
        `/checkout?plan=${encodeURIComponent(plan.slug)}&period=${period}&region=${region}`,
      ),
    );
  }
  return (
    <section id="pricing" className="relative overflow-hidden px-5 py-28">
      <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-rose/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t("billing.eyebrow")}</p>
          <h2 className="mt-4 font-serif text-4xl sm:text-6xl">
            {t("billing.headline")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-ink/55">
            {t("billing.subtext")}
          </p>
        </div>
        <div className="mx-auto mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="relative">
            <button
              aria-expanded={open}
              aria-haspopup="listbox"
              onClick={() => setOpen((v) => !v)}
              className="focus-ring flex min-h-12 min-w-56 items-center gap-3 rounded-full border bg-paper px-4 text-sm shadow-sm"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-wine/8 text-[10px] font-bold text-wine">
                {region}
              </span>
              <span className="flex-1 text-left font-bold">
                {REGION_META[region].label}
              </span>
              <span className="text-xs text-ink/40">
                {REGION_META[region].currency}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  role="listbox"
                  initial={reduce ? false : { opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: reduce ? 0 : 0.22 }}
                  className="absolute left-0 top-14 z-20 w-full rounded-2xl border bg-paper p-2 shadow-warm"
                >
                  {(Object.keys(REGION_META) as BillingRegion[]).map(
                    (code, index) => (
                      <motion.button
                        key={code}
                        initial={reduce ? false : { opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reduce ? 0 : index * 0.025 }}
                        onClick={() => {
                          setRegion(code);
                          setOpen(false);
                        }}
                        className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-wine/5"
                      >
                        <span className="w-7 text-[10px] font-bold text-wine">
                          {code}
                        </span>
                        <span className="flex-1 font-semibold">
                          {REGION_META[code].label}
                        </span>
                        {code === region && (
                          <Check className="h-4 w-4 text-wine" />
                        )}
                      </motion.button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex rounded-full border bg-paper p-1 text-xs font-bold">
            <button
              onClick={() => setInterval("monthly")}
              className={`min-h-10 rounded-full px-4 transition ${interval === "monthly" ? "bg-wine text-white" : ""}`}
            >
              {t("billing.monthly")}
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`min-h-10 rounded-full px-4 transition ${interval === "yearly" ? "bg-wine text-white" : ""}`}
            >
              {t("billing.yearly")}
            </button>
          </div>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PriceCard
              key={plan.slug}
              plan={plan}
              icon={
                index === 0 ? Sparkles : plan.isFeatured ? Crown : ShieldCheck
              }
              price={formatDynamicPlanPrice(
                plan,
                plan.lifetimePrice != null && plan.monthlyPrice == null
                  ? "lifetime"
                  : interval,
                region,
                REGION_META[region].locale,
              )}
              period={
                plan.isFree
                  ? "forever"
                  : plan.lifetimePrice != null && plan.monthlyPrice == null
                    ? t("billing.oneTime")
                    : interval === "yearly"
                      ? t("billing.perYear")
                      : t("billing.perMonth")
              }
              busy={checking === plan.slug}
              onCta={() => purchase(plan)}
            />
          ))}
        </div>
        <p className="mt-7 text-center text-xs text-ink/40">
          {t("billing.trust")}
        </p>
        <div className="mx-auto mt-20 max-w-3xl">
          <h3 className="text-center font-serif text-4xl">
            {t("billing.faq")}
          </h3>
          <div className="mt-7 divide-y rounded-[1.5rem] border bg-paper px-6 shadow-card">
            {[
              ["faq1q", "faq1a"],
              ["faq2q", "faq2a"],
              ["faq3q", "faq3a"],
            ].map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="cursor-pointer list-none font-semibold">
                  {t(`billing.${q}` as "billing.faq1q")}
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink/55">
                  {t(`billing.${a}` as "billing.faq1a")}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
function PriceCard({
  plan,
  icon: Icon,
  price,
  period,
  busy,
  onCta,
}: {
  plan: DynamicPlan;
  icon: typeof Sparkles;
  price: string;
  period: string;
  busy: boolean;
  onCta: () => void;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-[1.8rem] border p-7 ${plan.isFeatured ? "border-wine bg-wine text-white shadow-warm lg:-translate-y-4" : "bg-paper shadow-card"}`}
    >
      {plan.badgeText && (
        <span className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase">
          {plan.badgeText}
        </span>
      )}
      <Icon className={plan.isFeatured ? "text-[#f2cbc6]" : "text-wine"} />
      <h3 className="mt-7 font-serif text-3xl">{plan.name}</h3>
      <p
        className={`mt-2 min-h-12 text-sm leading-6 ${plan.isFeatured ? "text-white/60" : "text-ink/50"}`}
      >
        {plan.description}
      </p>
      <div className="mt-7">
        <strong className="font-sans text-4xl font-extrabold tracking-[-.04em]">
          {price}
        </strong>
        <span
          className={`ml-2 text-xs ${plan.isFeatured ? "text-white/50" : "text-ink/40"}`}
        >
          {period}
        </span>
      </div>
      <ul className="my-7 space-y-3">
        {getPlanMarketingFeatures(plan).map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <span
              className={`grid h-5 w-5 place-items-center rounded-full ${plan.isFeatured ? "bg-white/15" : "bg-wine/8 text-wine"}`}
            >
              <Check className="h-3 w-3" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <PremiumButton
        onClick={onCta}
        variant={plan.isFeatured ? "secondary" : "primary"}
        className={`mt-auto w-full ${plan.isFeatured ? "border-white/20 bg-white text-wine hover:bg-[#fff7f4]" : ""}`}
      >
        {busy ? "Loading…" : PRODUCT_STATUS.publicSignupEnabled ? plan.ctaText || "Choose plan" : "View case study"}
      </PremiumButton>
    </article>
  );
}
