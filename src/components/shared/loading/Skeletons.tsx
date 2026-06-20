import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("ourside-skeleton rounded-xl", className)} />;
}

export function MemoryCardSkeleton() {
  return <div className="overflow-hidden rounded-[1.5rem] border bg-paper shadow-card"><Skeleton className="aspect-[4/3] rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div></div>;
}

export function DashboardSkeleton() {
  return <div aria-busy="true" aria-label="Loading your Ourside" className="space-y-9"><section className="rounded-[2rem] border bg-paper p-7 sm:p-10"><Skeleton className="h-4 w-32" /><Skeleton className="mt-5 h-14 w-3/5" /><Skeleton className="mt-4 h-5 w-40" /><div className="mt-10 grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div></section><div><Skeleton className="h-8 w-52" /><div className="mt-5 grid gap-5 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <MemoryCardSkeleton key={index} />)}</div></div></div>;
}

export function GalleryGridSkeleton() {
  return <div aria-busy="true" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className={index % 3 === 0 ? "aspect-[3/4]" : "aspect-square"} />)}</div>;
}

export function SettingsSkeleton() {
  return <div aria-busy="true"><Skeleton className="h-12 w-56" /><Skeleton className="mt-3 h-4 w-80 max-w-full" /><div className="mt-9 grid gap-5 lg:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="rounded-[1.5rem] border bg-paper p-6"><Skeleton className="h-8 w-1/2" /><Skeleton className="mt-6 h-12" /><Skeleton className="mt-3 h-12" /><Skeleton className="mt-5 h-12 w-36 rounded-full" /></div>)}</div></div>;
}

export function VaultSkeleton() {
  return <div aria-busy="true"><Skeleton className="h-12 w-64" /><div className="mt-8 grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-[1.5rem] border bg-paper p-6"><Skeleton className="h-11 w-11 rounded-full" /><Skeleton className="mt-8 h-7 w-3/4" /><Skeleton className="mt-4 h-4 w-full" /></div>)}</div></div>;
}

export function FormSkeleton() {
  return <div aria-busy="true" className="mx-auto max-w-xl rounded-[2rem] border bg-paper p-7"><Skeleton className="h-10 w-2/3" /><Skeleton className="mt-8 h-12" /><Skeleton className="mt-4 h-12" /><Skeleton className="mt-6 h-12 rounded-full" /></div>;
}
