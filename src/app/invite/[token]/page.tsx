"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartHandshake, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { coupleService, type InvitePreview } from "@/features/couples/couple.service";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/i18n/LocaleProvider";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const tr = locale === "tr";
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const [invite, session] = await Promise.all([coupleService.getInvitePreview(token), createClient()?.auth.getSession()]);
      if (!active) return;
      const signedIn = Boolean(session?.data.session);
      setPreview(invite);
      setAuthenticated(signedIn);

      if (signedIn && invite.ok && invite.valid && searchParams.get("auto") === "1") {
        const result = await coupleService.acceptPartnerInvite(token);
        if (!active) return;
        if (result.ok) { router.replace("/dashboard"); return; }
        setMessage(result.message);
      }
      setBusy(false);
    }
    load();
    return () => { active = false; };
  }, [router, searchParams, token]);

  async function accept() {
    if (!authenticated) {
      const returnTo = `/invite/${token}?auto=1`;
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    setBusy(true);
    setMessage("");
    const result = await coupleService.acceptPartnerInvite(token);
    setBusy(false);
    if (!result.ok) setMessage(result.message);
    else router.replace("/dashboard");
  }

  const valid = preview?.ok && preview.valid;
  return <main className="grid min-h-screen place-items-center bg-cream p-5"><div className="w-full max-w-xl"><Logo /><section className="mt-10 rounded-[2rem] border bg-paper p-7 text-center shadow-warm sm:p-10"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${valid ? "bg-wine/10 text-wine" : "bg-ink/5 text-ink/40"}`}>{valid ? <HeartHandshake /> : <LockKeyhole />}</span>{busy ? <p className="mt-6 text-sm text-ink/50">{tr ? "Davet kontrol ediliyor…" : "Checking invitation…"}</p> : valid ? <><p className="eyebrow mt-6">{tr ? "Özel davet" : "Private invitation"}</p><h1 className="mt-3 font-serif text-4xl">{tr ? `${preview.inviterName} sizi ${preview.coupleName} alanına davet ediyor.` : `${preview.inviterName} invited you to ${preview.coupleName}.`}</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink/55">{tr ? "Hesabınızı oluşturduktan veya giriş yaptıktan sonra bu ortak alana doğrudan katılırsınız. Kendi Ourside’ınızı oluşturmanız gerekmez." : "After creating an account or logging in, you will join this shared space directly. You will not need to create another Ourside."}</p><PremiumButton type="button" disabled={busy} ariaBusy={busy} onClick={accept} className="mt-7 w-full">{authenticated ? (tr ? "Ourside’a katıl" : "Join this Ourside") : (tr ? "Giriş yap veya hesap oluştur" : "Log in or create an account")}</PremiumButton></> : <><h1 className="mt-6 font-serif text-4xl">{tr ? "Bu davet artık geçerli değil." : "This invitation is no longer valid."}</h1><p className="mt-3 text-sm text-ink/55">{tr ? "Bağlantının süresi dolmuş, yenilenmiş veya Ourside iki kişiye ulaşmış olabilir." : "It may have expired, been replaced, or the Ourside may already have two members."}</p><PremiumButton href="/" variant="secondary" className="mt-7">{tr ? "Ana sayfaya dön" : "Return home"}</PremiumButton></>}{message && <p role="alert" className="mt-4 text-sm text-red-700">{message}</p>}<div className="mt-7 flex items-center justify-center gap-2 text-xs text-ink/40"><LockKeyhole className="h-3.5 w-3.5" />{tr ? "Özel ve yalnızca iki kişilik" : "Private and limited to two people"}</div></section><p className="mt-5 text-center text-xs text-ink/40"><Link href="/">Ourside</Link> · Our little world, kept forever.</p></div></main>;
}
