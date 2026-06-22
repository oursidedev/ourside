"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartHandshake,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { useToast } from "@/components/ui/ToastProvider";
import {
  coupleService,
  normalizeInviteCode,
  type InvitePreview,
} from "@/features/couples/couple.service";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/i18n/LocaleProvider";
export default function JoinByCodePage() {
  const { locale } = useLocale();
  const tr = locale === "tr";
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const initial = params.get("code");
    if (initial) setCode(normalizeInviteCode(initial));
  }, [params]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const normalized = normalizeInviteCode(code);
    if (normalized.length < 8) {
      setError(
        tr ? "Geçerli bir davet kodu girin." : "Enter a valid invite code.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setPreview(null);
    const invite = await coupleService.getInvitePreviewByCode(normalized);
    if (!invite.ok || !invite.valid) {
      const message = invite.ok
        ? tr
          ? "Bu kodun süresi dolmuş, kullanılmış veya iptal edilmiş."
          : "This code has expired, been used, or revoked."
        : invite.message;
      setError(message);
      toast(message, "error");
      setBusy(false);
      return;
    }
    setPreview(invite);
    const session = await createClient()?.auth.getSession();
    if (!session?.data.session) {
      setBusy(false);
      const next = `/join?code=${encodeURIComponent(normalized)}`;
      // Portfolio mode does not create invitees. Existing authorized users can
      // log in and then resume the invite acceptance flow.
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    const result = await coupleService.acceptPartnerInviteByCode(normalized);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      toast(result.message, "error");
      return;
    }
    toast(tr ? "Ourside’a katıldınız." : "You joined the Ourside.", "success");
    router.replace("/dashboard");
    router.refresh();
  }
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-5">
      <div className="w-full max-w-xl">
        <Logo />
        <section className="mt-10 rounded-[2rem] border bg-paper p-7 shadow-warm sm:p-10">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-wine/10 text-wine">
            <KeyRound />
          </span>
          <p className="eyebrow mt-7">{tr ? "Davet kodu" : "Invite code"}</p>
          <h1 className="mt-3 font-serif text-4xl">
            {tr
              ? "Partnerinizin Ourside’ına katılın."
              : "Join your partner’s Ourside."}
          </h1>
          <p className="mt-4 text-sm leading-6 text-ink/55">
            {tr
              ? "Size gönderilen kısa kodu yapıştırın. Boşlukları ve küçük harfleri otomatik düzelteceğiz."
              : "Paste the short code you received. We’ll normalize spaces and lowercase letters automatically."}
          </p>
          <form onSubmit={submit} className="mt-7">
            <label className="text-sm font-bold">
              {tr ? "Davet kodu" : "Invite code"}
              <input
                autoFocus
                autoComplete="one-time-code"
                value={code}
                onChange={(event) =>
                  setCode(normalizeInviteCode(event.target.value))
                }
                placeholder="OURS-7KQ9"
                maxLength={14}
                className="focus-ring mt-2 h-16 w-full rounded-xl border bg-cream px-5 text-center font-mono text-2xl font-bold uppercase tracking-[.18em] text-wine"
              />
            </label>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            {preview?.ok && preview.valid && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <HeartHandshake className="h-5 w-5" />
                <span>
                  <strong>{preview.inviterName}</strong> · {preview.coupleName}
                </span>
              </div>
            )}
            <PremiumButton
              type="submit"
              disabled={busy}
              ariaBusy={busy}
              className="mt-5 w-full"
            >
              {busy ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {tr ? "Kod kontrol ediliyor…" : "Checking code…"}
                </>
              ) : tr ? (
                "Kodla katıl"
              ) : (
                "Join with code"
              )}
            </PremiumButton>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink/40">
            <LockKeyhole className="h-3.5 w-3.5" />
            {tr
              ? "Özel ve yalnızca iki kişilik"
              : "Private and limited to two people"}
          </div>
        </section>
      </div>
    </main>
  );
}
