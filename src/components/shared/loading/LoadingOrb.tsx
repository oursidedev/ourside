import { cn } from "@/lib/utils/cn";

export function LoadingOrb({ className, label = "Loading" }: { className?: string; label?: string }) {
  return <span role="status" aria-label={label} className={cn("relative inline-grid h-12 w-12 place-items-center", className)}>
    <span className="absolute inset-1 rounded-full bg-gradient-to-br from-[#f1c7c2] via-[#9a5963] to-[#ded3ed] opacity-85 shadow-lg shadow-wine/15 motion-safe:animate-[orbPulse_1.6s_ease-in-out_infinite]" />
    <span className="absolute h-2.5 w-2.5 rounded-full bg-paper shadow motion-safe:animate-[orbOrbit_1.8s_linear_infinite]" />
    <span className="relative h-3 w-3 rounded-full bg-paper/90" />
  </span>;
}
