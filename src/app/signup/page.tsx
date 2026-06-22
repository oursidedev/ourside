import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { PRODUCT_STATUS } from "@/config/product-status";
import { marketingUrl } from "@/config/brand";
export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };
export default function Page() {
  return <AuthLayout eyebrow={PRODUCT_STATUS.publicSignupEnabled ? "Your story starts here" : "Portfolio case study"}>
    {PRODUCT_STATUS.publicSignupEnabled ? <AuthForm mode="signup" /> : <section className="mt-5 rounded-[1.75rem] border bg-cream/70 p-6 shadow-card sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-wine/10 text-wine"><LockKeyhole className="h-5 w-5" /></span>
      <h1 className="mt-6 font-serif text-4xl leading-tight">Ourside is closed to new signups.</h1>
      <p className="mt-4 text-sm leading-7 text-ink/60">This project is now preserved as a portfolio case study. Existing authorized users and the owner can still log in.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <PremiumButton href="/login">Log in</PremiumButton>
        <PremiumButton href={marketingUrl("/#case-study")} variant="secondary">View case study</PremiumButton>
      </div>
      <p className="mt-6 text-center text-xs text-ink/45"><Link href={marketingUrl()} className="font-bold text-wine hover:underline">Back to home</Link></p>
    </section>}
  </AuthLayout>;
}
