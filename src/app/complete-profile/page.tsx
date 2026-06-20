"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { authService } from "@/features/auth/auth.service";
import { useLocale } from "@/i18n/LocaleProvider";

export default function CompleteProfilePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useLocale();
  const tr = locale === "tr";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const requestedNext = params.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  useEffect(() => {
    authService.getProfileNames().then((result) => {
      if (result.ok) {
        setFirstName(result.firstName);
        setLastName(result.lastName);
      } else setMessage(result.message);
      setBusy(false);
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !firstName.trim() || !lastName.trim()) return;
    setBusy(true);
    setMessage(null);
    const result = await authService.updateProfileNames(firstName, lastName);
    setBusy(false);
    if (!result.ok) setMessage(result.message);
    else router.replace(next);
  }

  return <AuthLayout eyebrow={tr ? "Profil bilgileri" : "Profile details"}><h1 className="mt-4 font-serif text-4xl leading-tight">{tr ? "Size nasıl hitap edelim?" : "How should we address you?"}</h1><p className="mt-4 text-sm leading-6 text-ink/55">{tr ? "Google veya Apple hesabınızdan gelen bilgileri kontrol edin. Ourside’da adınız ve soyadınız birlikte kullanılacak." : "Check the details received from Google or Apple. Ourside will use your first and last name."}</p><form onSubmit={submit} className="mt-8 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-ink/85">{tr ? "Ad" : "First name"}<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" className="mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white/60 px-4 outline-none transition focus:border-wine/45 focus:ring-4 focus:ring-wine/8" /></label><label className="text-sm font-bold text-ink/85">{tr ? "Soyad" : "Last name"}<input required value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" className="mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white/60 px-4 outline-none transition focus:border-wine/45 focus:ring-4 focus:ring-wine/8" /></label></div>{message && <div role="status" className="rounded-xl border border-wine/15 bg-wine/5 p-3 text-sm text-wine">{message}</div>}<PremiumButton type="submit" disabled={busy || !firstName.trim() || !lastName.trim()} ariaBusy={busy} className="h-14 w-full">{busy ? (tr ? "Kontrol ediliyor…" : "Checking…") : (tr ? "Devam et" : "Continue")}</PremiumButton></form></AuthLayout>;
}
