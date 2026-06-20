import type { Metadata } from "next";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";
import { BRAND, marketingUrl } from "@/config/brand";
export const metadata: Metadata = { title: "Support", alternates: { canonical: marketingUrl("/contact") } };
export default function Page(){return <PublicPageShell title="We are here when you need us." intro="Account, privacy or product questions can be sent directly to the Ourside support team."><section className="rounded-3xl border bg-paper p-7 shadow-card"><h2 className="font-serif text-3xl">Contact support</h2><a className="mt-4 inline-block font-bold text-wine underline" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a></section></PublicPageShell>}
