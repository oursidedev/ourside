/** In-memory upload queue with cancellation/retry. A future native adapter can persist this state for offline/background uploads. */
import type { MediaUploadItem, PreparedImage } from "./media.types";

export type QueueListener = (items: MediaUploadItem[]) => void;
export class MediaUploadQueue {
  private items = new Map<string, MediaUploadItem>(); private controllers = new Map<string, AbortController>(); private listeners = new Set<QueueListener>();
  snapshot() { return Array.from(this.items.values()); }
  subscribe(listener: QueueListener) { this.listeners.add(listener); listener(this.snapshot()); return () => this.listeners.delete(listener); }
  add(file: File) { const id = crypto.randomUUID(); this.items.set(id, { id, fileName: file.name, previewUrl: URL.createObjectURL(file), progress: 0, status: "queued" }); this.emit(); return id; }
  update(id: string, patch: Partial<MediaUploadItem>) { const current = this.items.get(id); if (!current) return; this.items.set(id, { ...current, ...patch }); this.emit(); }
  attachPrepared(id: string, prepared: PreparedImage) { const old = this.items.get(id); if (old?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(old.previewUrl); this.update(id, { prepared, previewUrl: prepared.previewUrl, progress: 100, status: "complete", error: undefined }); }
  controller(id: string) { this.controllers.get(id)?.abort(); const controller = new AbortController(); this.controllers.set(id, controller); return controller; }
  cancel(id: string) { this.controllers.get(id)?.abort(); this.update(id, { status: "cancelled" }); }
  remove(id: string) { const item = this.items.get(id); if (item?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl); this.controllers.get(id)?.abort(); this.controllers.delete(id); this.items.delete(id); this.emit(); }
  private emit() { const snapshot = this.snapshot(); this.listeners.forEach((listener) => listener(snapshot)); }
}
