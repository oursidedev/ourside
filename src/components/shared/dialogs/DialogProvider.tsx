"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Info, LoaderCircle, X } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";

type DialogTone = "default" | "destructive" | "warning";
type DialogOptions = { title: string; description: string; confirmLabel?: string; cancelLabel?: string; tone?: DialogTone };
type PromptOptions = DialogOptions & { placeholder?: string; initialValue?: string; required?: boolean };
type ActiveDialog = (DialogOptions & { kind: "confirm" | "info"; resolve: (value: boolean) => void }) | (PromptOptions & { kind: "prompt"; resolve: (value: string | null) => void });
type DialogApi = { confirm: (options: DialogOptions) => Promise<boolean>; info: (options: DialogOptions) => Promise<void>; prompt: (options: PromptOptions) => Promise<string | null> };

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const rememberTrigger = () => { triggerRef.current = document.activeElement as HTMLElement | null; };
  const confirm = useCallback((options: DialogOptions) => new Promise<boolean>((resolve) => { rememberTrigger(); setDialog({ ...options, kind: "confirm", resolve }); }), []);
  const info = useCallback((options: DialogOptions) => new Promise<void>((resolve) => { rememberTrigger(); setDialog({ ...options, kind: "info", resolve: () => resolve() }); }), []);
  const prompt = useCallback((options: PromptOptions) => new Promise<string | null>((resolve) => { rememberTrigger(); setValue(options.initialValue || ""); setDialog({ ...options, kind: "prompt", resolve }); }), []);

  const close = useCallback((accepted = false) => {
    if (!dialog || pending) return;
    if (dialog.kind === "prompt") dialog.resolve(accepted ? value.trim() : null);
    else dialog.resolve(accepted);
    setDialog(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, [dialog, pending, value]);

  useEffect(() => {
    if (!dialog) return;
    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>("input,button:not([disabled])");
    focusable?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close(false); }
      if (event.key !== "Tab" || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>("button:not([disabled]),input:not([disabled])"));
      if (!nodes.length) return;
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, close]);

  const api = useMemo(() => ({ confirm, info, prompt }), [confirm, info, prompt]);
  const destructive = dialog?.tone === "destructive";
  const Icon = destructive || dialog?.tone === "warning" ? AlertTriangle : Info;

  return <DialogContext.Provider value={api}>{children}{dialog && <div className="fixed inset-0 z-[260] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(false); }}><div ref={panelRef} role="alertdialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-description" className="w-full max-w-md rounded-t-[2rem] border bg-paper p-6 shadow-warm sm:rounded-[1.75rem] sm:p-7"><div className="flex items-start justify-between gap-4"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${destructive ? "bg-red-100 text-red-700" : "bg-wine/10 text-wine"}`}><Icon className="h-5 w-5" /></span><button type="button" aria-label="Close" onClick={() => close(false)} className="focus-ring grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"><X className="h-5 w-5" /></button></div><h2 id="app-dialog-title" className="mt-5 font-serif text-3xl">{dialog.title}</h2><p id="app-dialog-description" className="mt-3 text-sm leading-6 text-ink/55">{dialog.description}</p>{dialog.kind === "prompt" && <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={dialog.placeholder} className="focus-ring mt-5 h-12 w-full rounded-xl border bg-cream px-4" onKeyDown={(event) => { if (event.key === "Enter" && (!dialog.required || value.trim())) close(true); }} />}<div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{dialog.kind !== "info" && <PremiumButton variant="secondary" onClick={() => close(false)}>{dialog.cancelLabel || "Cancel"}</PremiumButton>}<button type="button" disabled={pending || (dialog.kind === "prompt" && dialog.required && !value.trim())} onClick={() => { setPending(true); close(true); setPending(false); }} className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white disabled:opacity-50 ${destructive ? "bg-red-700 hover:bg-red-800" : "bg-wine hover:bg-wine/90"}`}>{pending && <LoaderCircle className="h-4 w-4 animate-spin" />}{dialog.confirmLabel || (dialog.kind === "info" ? "Got it" : "Confirm")}</button></div></div></div>}</DialogContext.Provider>;
}

export function useAppDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useAppDialog must be used inside DialogProvider");
  return context;
}
