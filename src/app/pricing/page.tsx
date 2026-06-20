import type { Metadata } from "next";
import Link from "next/link";
import { PricingSection } from "@/components/PricingSection";
import { appUrl, marketingUrl } from "@/config/brand";

export const metadata: Metadata = { title: "Pricing", alternates: { canonical: marketingUrl("/pricing") } };
export default function PricingPage() { return <main className="min-h-screen bg-cream"><nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6"><Link href={marketingUrl()} className="font-serif text-2xl">Our<em className="text-wine">side</em></Link><Link href={appUrl('/login')} className="text-sm font-bold text-wine">Sign in</Link></nav><PricingSection /></main>; }
