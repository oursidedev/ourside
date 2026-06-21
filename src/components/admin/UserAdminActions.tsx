"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDialog } from "@/components/shared/dialogs/DialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import type { DynamicPlan } from "@/features/billing/plans.types";

type Props = { userId: string; currentPlanSlug: string; customerEmail: string };

export function UserAdminActions({ userId, currentPlanSlug, customerEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<DynamicPlan[]>([]);
  const [selected, setSelected] = useState(currentPlanSlug);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [busy, setBusy] = useState(false);
  const { confirm } = useAppDialog();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => setSelected(currentPlanSlug), [currentPlanSlug]);

  async function openPlanSelector() {
    setOpen(true);
    if (plans.length) return;
    setLoadingPlans(true);
    try {
      const response = await fetch("/api/admin/plans", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plans could not be loaded");
      setPlans((data.plans as DynamicPlan[]).filter((plan) => plan.isActive));
    } catch (error) {
      toast(error instanceof Error ? error.message : "Plans could not be loaded", "error");
      setOpen(false);
    } finally {
      setLoadingPlans(false);
    }
  }

  async function applyPlan() {
    const plan = plans.find((item) => item.slug === selected);
    if (!plan || selected === currentPlanSlug) return;
    const accepted = await confirm({
      title: `Change plan to ${plan.name}?`,
      description: `Access will change immediately for ${customerEmail}. A plan-change email will also be sent to the customer.`,
      confirmLabel: "Change plan and send email",
      cancelLabel: "Cancel",
      tone: plan.isFree ? "destructive" : "default",
    });
    if (!accepted) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planSlug: selected, reason: "Admin plan selection" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Plan could not be changed");
      if (data.email?.sent) toast(`Plan changed to ${plan.name}. Customer email sent.`, "success");
      else toast(`Plan changed to ${plan.name}, but email delivery failed: ${data.email?.error || "email provider is not configured"}`, "warning");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Plan could not be changed", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={openPlanSelector} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-wine px-4 text-sm font-bold text-white transition active:scale-[.98]">
        Select plan <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/35 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="plan-dialog-title">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] border border-wine/10 bg-paper p-5 shadow-2xl sm:max-w-lg sm:rounded-[28px] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-wine/70">Customer access</p><h2 id="plan-dialog-title" className="mt-2 font-serif text-3xl text-ink">Select a plan</h2><p className="mt-2 text-sm text-ink/55">Plans are loaded directly from the plan database. New active plans appear here automatically.</p></div>
              <button onClick={() => !busy && setOpen(false)} aria-label="Close" className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid gap-3">
              {loadingPlans ? <div className="flex min-h-32 items-center justify-center text-sm text-ink/55"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading plans</div> : plans.map((plan) => (
                <button key={plan.id} onClick={() => setSelected(plan.slug)} className={`focus-ring flex min-h-16 items-center justify-between rounded-2xl border px-4 text-left transition ${selected === plan.slug ? "border-wine bg-wine/5" : "bg-white hover:border-wine/30"}`}>
                  <span><span className="block font-bold text-ink">{plan.name}</span><span className="mt-1 block text-xs text-ink/50">{plan.description || plan.slug}</span></span>
                  <span className={`grid h-6 w-6 place-items-center rounded-full border ${selected === plan.slug ? "border-wine bg-wine text-white" : "border-ink/15"}`}>{selected === plan.slug && <Check className="h-3.5 w-3.5" />}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setOpen(false)} disabled={busy} className="focus-ring min-h-11 rounded-full border px-5 text-sm font-bold">Cancel</button>
              <button onClick={applyPlan} disabled={busy || loadingPlans || selected === currentPlanSlug} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-wine px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{busy ? "Changing plan" : "Continue"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
