import Link from "next/link";
import { appUrl, marketingUrl, BRAND } from "@/config/brand";

export function PublicPageShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-cream px-5 py-6 text-ink"><nav className="mx-auto flex max-w-5xl items-center justify-between"><Link href={marketingUrl()} className="font-serif text-2xl">Our<em className="text-wine">side</em></Link><div className="flex items-center gap-3 text-sm"><Link href={appUrl('/login')} className="font-semibold text-wine">Sign in</Link><Link href={appUrl('/signup')} className="rounded-full bg-wine px-5 py-3 font-bold text-white">Create your Ourside</Link></div></nav><article className="mx-auto max-w-3xl py-20 sm:py-28"><p className="eyebrow">{BRAND.name}</p><h1 className="mt-4 font-serif text-5xl leading-tight sm:text-7xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-ink/60">{intro}</p><div className="mt-12 space-y-8 text-sm leading-7 text-ink/70">{children}</div></article></main>;
}
