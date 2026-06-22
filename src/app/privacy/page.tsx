import type { Metadata } from "next";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";
import { BRAND, marketingUrl } from "@/config/brand";
export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: marketingUrl("/privacy") },
};
export default function Page() {
  return (
    <PublicPageShell
      title="Your story stays yours."
      intro="Ourside is preserved as a portfolio case study. This notice distinguishes the public demo from the protected application and explains how demo interactions are handled."
    >
      <section>
        <h2 className="font-serif text-3xl">Public demo data</h2>
        <p className="mt-3">
          The interactive demo uses fictional content. Text entered into demo
          controls remains only in volatile page memory and is removed when the
          page is refreshed, closed, or left. It is not intentionally submitted
          to Supabase, application APIs, storage, email services, cookies,
          localStorage, or sessionStorage. File, camera, and microphone uploads
          are disabled.
        </p>
        <p className="mt-3">
          Do not enter real names, contact details, passwords, intimate
          information, health information, confidential material, or copyrighted
          private media into the public demo.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Operational analytics</h2>
        <p className="mt-3">
          Public marketing pages may record privacy-conscious operational
          information such as a sanitized page path, anonymous visit count,
          device category, or error status. The interactive /demo route is
          excluded from that tracker and demo form text is never included in
          analytics payloads.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Protected application data</h2>
        <p className="mt-3">
          Existing authorized accounts remain separated from the demo. Couple
          content is limited to authenticated members of that couple space, and
          private media is designed for signed access rather than public URLs.
          The demo does not query or display production couple records.
        </p>
      </section>
      <p>
        For privacy questions, contact{" "}
        <a
          className="font-bold text-wine"
          href={`mailto:${BRAND.supportEmail}`}
        >
          {BRAND.supportEmail}
        </a>
        .
      </p>
    </PublicPageShell>
  );
}
