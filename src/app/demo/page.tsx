import type { Metadata } from "next";
import { DemoDashboard } from "@/components/demo/DemoDashboard";
import { PRODUCT_STATUS } from "@/config/product-status";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";

export const metadata: Metadata = {
  title: "Interactive Product Demo",
  description:
    "Explore the Ourside product concept in a public, non-persistent portfolio sandbox.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  if (!PRODUCT_STATUS.demoAccessEnabled)
    return (
      <PublicPageShell
        title="Demo access is unavailable"
        intro="The public portfolio sandbox is currently disabled."
      >
        <p>
          Return to the case study to review the product architecture and
          design.
        </p>
      </PublicPageShell>
    );
  return <DemoDashboard />;
}
