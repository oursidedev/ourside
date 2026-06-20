import { LoadingOrb } from "./LoadingOrb";

export function AppLoader({ label = "Opening your Ourside…" }: { label?: string }) {
  return <div className="grid min-h-[45vh] place-items-center" aria-busy="true"><div className="text-center"><LoadingOrb label={label} /><p className="mt-4 text-sm font-semibold text-ink/50">{label}</p></div></div>;
}
