"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Bell, CheckCheck, ChevronRight, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { notificationService } from "../notification.service";
import type { AppNotification } from "../notification.types";
import { subscribeToTable } from "@/lib/supabase/realtime";
import { useLocale } from "@/i18n/LocaleProvider";

function formatNotificationDate(value: string, locale: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function NotificationBell() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    try {
      const [list, count] = await Promise.all([notificationService.list(), notificationService.unreadCount()]);
      setItems(list);
      setUnread(count);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Notifications could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return subscribeToTable("notifications", () => void load());
  }, [load]);

  function show() {
    setOpen(true);
    void load(items.length === 0);
  }

  function read(item: AppNotification) {
    if (!item.readAt) {
      const now = new Date().toISOString();
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, readAt: now } : value));
      setUnread((value) => Math.max(0, value - 1));
      void notificationService.markRead(item.id).catch(() => void load());
    }
    setOpen(false);
    if (item.actionUrl) router.push(item.actionUrl);
  }

  function readAll() {
    const now = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || now })));
    setUnread(0);
    void notificationService.markAllRead().catch(() => void load());
  }

  function archive(event: React.MouseEvent, id: string) {
    event.stopPropagation();
    setItems((current) => current.filter((item) => item.id !== id));
    void notificationService.archive(id).catch(() => void load());
  }

  return <>
    <button type="button" aria-label={t("notifications.title")} onClick={show} className="focus-ring relative grid h-11 w-11 place-items-center rounded-full border bg-paper active:scale-95">
      <Bell className="h-[18px] w-[18px]" />
      {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-wine px-1 text-[10px] font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <div className="fixed inset-0 z-[180] flex items-end bg-ink/35 sm:items-start sm:justify-end sm:p-5" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }} role="dialog" aria-modal="true" aria-label={t("notifications.title")}>
      <section className="flex max-h-[88vh] w-full flex-col rounded-t-[2rem] bg-paper shadow-warm sm:mt-16 sm:max-w-md sm:rounded-[1.5rem]">
        <header className="flex items-center justify-between border-b p-5"><div><p className="eyebrow">{t("notifications.between")}</p><h2 className="font-serif text-3xl">{t("notifications.title")}</h2></div><button type="button" onClick={() => setOpen(false)} className="focus-ring grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5" aria-label={t("notifications.close")}><X /></button></header>
        {items.length > 0 && <button type="button" onClick={readAll} className="flex min-h-12 items-center justify-end gap-2 border-b px-5 text-xs font-bold text-wine"><CheckCheck className="h-4 w-4" />{t("notifications.markAll")}</button>}
        <div className="min-h-52 overflow-y-auto p-3">
          {loading ? <div className="grid min-h-48 place-items-center text-wine"><LoaderCircle className="animate-spin" /></div>
            : error ? <div className="m-3 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}<button onClick={() => void load(true)} className="mt-2 block font-bold">{t("notifications.retry")}</button></div>
            : items.length === 0 ? <div className="grid min-h-52 place-items-center px-8 text-center"><div><Bell className="mx-auto text-rose" /><h3 className="mt-4 font-serif text-2xl">{t("notifications.emptyTitle")}</h3><p className="mt-2 text-sm text-ink/50">{t("notifications.emptyText")}</p></div></div>
            : items.map((item) => <div role="button" tabIndex={0} key={item.id} onClick={() => read(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") read(item); }} className={`group mb-1 flex w-full cursor-pointer gap-3 rounded-xl p-4 text-left hover:bg-wine/5 ${item.readAt ? "opacity-60" : "bg-wine/[.04]"}`}>
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.readAt ? "bg-transparent" : "bg-rose"}`} />
              <span className="min-w-0 flex-1"><strong className="block text-sm">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-ink/55">{item.body}</span><time className="mt-2 block text-[10px] text-ink/35">{formatNotificationDate(item.createdAt, locale)}</time></span>
              <span className="flex flex-col items-center gap-2"><button type="button" onClick={(event) => archive(event, item.id)} aria-label={t("notifications.archive")} className="grid h-8 w-8 place-items-center rounded-full opacity-0 hover:bg-ink/5 group-hover:opacity-100 focus:opacity-100"><Archive className="h-3.5 w-3.5" /></button>{item.actionUrl && <ChevronRight className="h-4 w-4 text-ink/25" />}</span>
            </div>)}
        </div>
      </section>
    </div>}
  </>;
}
