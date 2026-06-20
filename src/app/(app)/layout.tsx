import { AppShell } from "@/components/AppShell";
import { RomanticBackground } from "@/components/RomanticBackground";
import { PageTransition } from "@/components/shared/loading/PageTransition";
import type { Metadata } from "next";

// Authenticated memories must never be treated as public SEO content.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RomanticBackground />
      <AppShell><PageTransition>{children}</PageTransition></AppShell>
    </>
  );
}
