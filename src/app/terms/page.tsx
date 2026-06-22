import type { Metadata } from "next";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";
import { BRAND, marketingUrl } from "@/config/brand";
export const metadata: Metadata = {
  title: "Terms",
  alternates: { canonical: marketingUrl("/terms") },
};
export default function Page() {
  return (
    <PublicPageShell
      title="Terms made human."
      intro="Ourside is currently a portfolio case study. The public demo is provided only so visitors can evaluate the product concept and interface."
    >
      <section>
        <h2 className="font-serif text-3xl">A non-production demonstration</h2>
        <p className="mt-3">
          The demo is not an active consumer storage service, does not create an
          account or couple space, and should not be relied upon to retain
          information. Availability and functionality may change or be withdrawn
          without notice.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Temporary input</h2>
        <p className="mt-3">
          Any text entered into demo controls exists only for the current page
          session and is expected to disappear on refresh or navigation.
          Visitors must not submit personal, confidential, unlawful, infringing,
          or sensitive information. File and media submission is disabled.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-3xl">
          Fictional content and intellectual property
        </h2>
        <p className="mt-3">
          Names, relationship details, dates, memories, and letters shown in the
          demo are fictional examples. The interface, brand, code, and editorial
          assets remain subject to their applicable ownership and license terms.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-3xl">No warranty</h2>
        <p className="mt-3">
          The portfolio demo is presented for evaluation on an as-is basis. It
          is not legal, relationship, archival, security, or data-recovery
          advice and does not promise future product operation.
        </p>
      </section>
      <p>
        Questions can be sent to{" "}
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
