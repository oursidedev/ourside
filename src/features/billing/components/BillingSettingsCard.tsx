"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Skeleton } from "@/components/shared/loading/Skeletons";
import { useAppDialog } from "@/components/shared/dialogs/DialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useLocale } from "@/i18n/LocaleProvider";
import type { PlanSlug, Subscription } from "../billing.types";

type BillingState = { subscription: Subscription | null; plan: PlanSlug; mockEnabled: boolean };

export function BillingSettingsCard() {
  const { t } = useLocale();
  const { confirm: askConfirm } = useAppDialog();
  const { toast } = useToast();
  const [state, setState] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => { const response = await fetch("/api/billing/subscription", { cache: "no-store" }); if (response.ok) setState(await response.json()); }, []);
  useEffect(() => { void load(); }, [load]);

  async function action(url: string, body?: unknown) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await response.json();
      if (!response.ok) { const text = data.error || "Billing action failed."; setMessage(text); toast(text, "error"); }
      else if (data.url) location.assign(data.url);
      else { setMessage("Saved."); toast("Billing settings updated.", "success"); await load(); }
    } finally { setBusy(false); }
  }

  async function cancelSubscription() {
    const accepted = await askConfirm({ title: t("billing.cancel"), description: "Your access remains active until the end of the current billing period.", confirmLabel: t("billing.cancel"), cancelLabel: "Keep subscription", tone: "destructive" });
    if (accepted) void action("/api/billing/cancel");
  }

  if (!state) return <section className="mt-5 rounded-[1.5rem] border bg-paper p-6 shadow-card" aria-busy="true"><Skeleton className="h-7 w-48" /><Skeleton className="mt-5 h-12 w-full" /></section>;
  const label = state.plan === "free" ? t("billing.free") : state.plan === "lifetime" ? t("billing.forever") : t("billing.plus");
  const renewal = state.subscription?.currentPeriodEnd ? new Date(state.subscription.currentPeriodEnd).toLocaleDateString() : null;

  return <section className="mt-5 rounded-[1.5rem] border bg-paper p-6 shadow-card"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wine text-white"><CreditCard className="h-5 w-5" /></span><div><p className="eyebrow">{t("billing.currentPlan")}</p><h2 className="mt-1 font-serif text-3xl">{label}</h2><p className="mt-1 text-sm text-ink/50">{state.subscription?.status === "expired" ? t("billing.expired") : state.subscription?.status === "canceled" ? t("billing.canceled") : t("billing.active")}{renewal && ` · ${t("billing.renewal")} ${renewal}`}</p></div></div><div className="flex flex-wrap gap-2">{state.plan !== "free" && <><PremiumButton variant="secondary" onClick={() => action("/api/billing/portal")} loading={busy}>{t("billing.manage")}</PremiumButton><button type="button" disabled={busy} onClick={() => void cancelSubscription()} className="focus-ring min-h-12 rounded-full px-4 text-sm font-bold text-red-700 disabled:opacity-50">{t("billing.cancel")}</button></>}</div></div>
    {state.mockEnabled && <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-4"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900"><RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />{t("billing.mockMode")}</p><div className="mt-3 flex flex-wrap gap-2">{(["free", "plus", "lifetime"] as const).map((plan) => <button type="button" key={plan} disabled={busy} onClick={() => action("/api/billing/mock", { plan, status: "active" })} className={`min-h-10 rounded-full border px-4 text-xs font-bold ${state.plan === plan ? "bg-wine text-white" : "bg-paper"}`}>{plan}</button>)}<button type="button" disabled={busy || state.plan === "free"} onClick={() => action("/api/billing/mock", { plan: state.plan, status: "expired" })} className="min-h-10 rounded-full border bg-paper px-4 text-xs font-bold">{t("billing.expired")}</button></div></div>}
    {message && <p role="status" className="mt-4 text-sm text-wine">{message}</p>}<div className="mt-6 border-t pt-5"><h3 className="text-sm font-bold">{t("billing.history")}</h3><p className="mt-2 text-sm text-ink/45">{t("billing.noPayments")}</p></div></section>;
}
