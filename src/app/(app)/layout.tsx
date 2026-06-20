import { AppShell } from "@/components/AppShell";
import { RomanticBackground } from "@/components/RomanticBackground";
import { PageTransition } from "@/components/shared/loading/PageTransition";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RomanticBackground />
      <AppShell><PageTransition>{children}</PageTransition></AppShell>
    </>
  );
}
