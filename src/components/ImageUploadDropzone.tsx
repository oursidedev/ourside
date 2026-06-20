"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, ImagePlus, LoaderCircle, RotateCcw, Trash2, Upload } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { prepareImage, releasePreparedImage } from "@/features/media/imageCompression";
import { MAX_FILES_PER_SELECTION } from "@/features/media/media.constants";
import type { MediaPlan, PreparedImage, UploadStatus } from "@/features/media/media.types";
import { cn } from "@/lib/utils/cn";

type Selection = { id: string; file: File; previewUrl: string; progress: number; status: UploadStatus; error?: string; prepared?: PreparedImage };
type Props = { plan?: MediaPlan; maxFiles?: number; onPreparedChange?: (images: PreparedImage[]) => void; uploader?: (image: PreparedImage, onProgress: (progress: number) => void, signal: AbortSignal) => Promise<void> };

export function ImageUploadDropzone({ plan = "free", maxFiles = MAX_FILES_PER_SELECTION, onPreparedChange, uploader }: Props) {
  const { t } = useLocale(); const inputRef = useRef<HTMLInputElement>(null); const controllers = useRef(new Map<string, AbortController>());
  const [items, setItems] = useState<Selection[]>([]); const [dragging, setDragging] = useState(false); const [globalError, setGlobalError] = useState("");

  useEffect(() => { onPreparedChange?.(items.flatMap((item) => item.prepared ? [item.prepared] : [])); }, [items, onPreparedChange]);

  const processItem = useCallback(async (entry: Selection) => {
    const controller = new AbortController(); controllers.current.set(entry.id, controller);
    const update = (patch: Partial<Selection>) => setItems((current) => current.map((item) => item.id === entry.id ? { ...item, ...patch } : item));
    try {
      update({ status: "compressing", progress: 1, error: undefined });
      const prepared = await prepareImage(entry.file, plan, (progress) => update({ progress: Math.min(progress, 95) }));
      if (controller.signal.aborted) { releasePreparedImage(prepared); return; }
      if (entry.previewUrl.startsWith("blob:")) URL.revokeObjectURL(entry.previewUrl);
      update({ prepared, previewUrl: prepared.previewUrl, status: uploader ? "uploading" : "complete", progress: uploader ? 0 : 100 });
      if (uploader) await uploader(prepared, (progress) => update({ progress }), controller.signal);
      if (uploader) update({ status: "complete", progress: 100 });
    } catch (error) {
      if (!controller.signal.aborted) update({ status: "failed", progress: 0, error: error instanceof Error ? error.message : t("upload.failed") });
    } finally { controllers.current.delete(entry.id); }
  }, [plan, t, uploader]);

  const addFiles = useCallback((incoming: File[]) => {
    setGlobalError("");
    const available = Math.max(0, maxFiles - items.length); const files = incoming.slice(0, available);
    if (!files.length) { setGlobalError(`Choose up to ${maxFiles} photos at a time.`); return; }
    const additions = files.map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), progress: 0, status: "queued" as const }));
    setItems((current) => [...current, ...additions]); additions.forEach((entry) => void processItem(entry));
  }, [items.length, maxFiles, processItem]);

  function remove(id: string) {
    controllers.current.get(id)?.abort();
    setItems((current) => { const target = current.find((item) => item.id === id); if (target?.prepared) releasePreparedImage(target.prepared); else if (target?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl); const next = current.filter((item) => item.id !== id); onPreparedChange?.(next.flatMap((item) => item.prepared ? [item.prepared] : [])); return next; });
  }

  function retry(item: Selection) { if (item.prepared) releasePreparedImage(item.prepared); const replacement = { ...item, previewUrl: URL.createObjectURL(item.file), prepared: undefined, status: "queued" as const, error: undefined }; setItems((current) => current.map((entry) => entry.id === item.id ? replacement : entry)); void processItem(replacement); }

  return <div className="space-y-4">
    <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)); }} className={cn("focus-ring flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed bg-paper/60 p-6 text-center transition", dragging ? "border-wine bg-wine/5 shadow-card" : "hover:bg-paper")}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} aria-label={t("upload.choose")} />
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-wine/10 text-wine"><ImagePlus /></span>
      <strong>{t("upload.title")}</strong><span className="mt-1 text-sm text-ink/50">{t("upload.hint")}</span><span className="mt-2 text-xs text-ink/35">{t("upload.limit")}</span>
      <span className="mt-4 flex items-center gap-1 text-xs font-bold text-wine"><Upload className="h-3.5 w-3.5" /> {t("upload.choose")}</span>
    </div>
    {globalError && <p role="alert" className="flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{globalError}</p>}
    {items.length > 0 && <ul className="grid gap-3 sm:grid-cols-2" aria-live="polite">{items.map((item) => <li key={item.id} className="flex gap-3 rounded-xl border bg-cream/60 p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/5"><Image src={item.previewUrl} alt="" fill unoptimized className="object-cover" sizes="80px" /></div>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.file.name}</p><p className={cn("mt-1 flex items-center gap-1 text-xs", item.status === "failed" ? "text-red-700" : "text-ink/50")}>{item.status === "complete" ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : item.status === "failed" ? <AlertCircle className="h-3.5 w-3.5" /> : <LoaderCircle className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />}{item.status === "complete" ? t("upload.ready") : item.status === "failed" ? item.error || t("upload.failed") : `${t("upload.preparing")} · ${item.progress}%`}</p>
        {item.status !== "complete" && item.status !== "failed" && <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-wine transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${item.progress}%` }} /></div>}
        <div className="mt-2 flex gap-3">{item.status === "failed" && <button type="button" onClick={() => retry(item)} className="focus-ring flex items-center gap-1 text-xs font-bold text-wine"><RotateCcw className="h-3.5 w-3.5" />{t("upload.retry")}</button>}<button type="button" onClick={() => remove(item.id)} className="focus-ring flex items-center gap-1 text-xs font-bold text-ink/50 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" />{t("upload.remove")}</button></div>
      </div></li>)}</ul>}
  </div>;
}
