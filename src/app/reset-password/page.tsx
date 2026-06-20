"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { authService } from "@/features/auth/auth.service";
import { passwordSchema } from "@/lib/validations/schemas";
import { useLocale } from "@/i18n/LocaleProvider";
import { getAuthErrorMessage } from "@/features/auth/auth-errors";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const tr = locale === "tr";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const password = String(new FormData(event.currentTarget).get("password") || "");
    if (!passwordSchema.safeParse(password).success) {
      setMessage(tr ? "Şifre en az 8 karakter, bir büyük harf ve bir özel karakter içermelidir." : "Use at least 8 characters, one uppercase letter and one special character.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await authService.updatePassword(password);
      if (!result.ok) setMessage(result.code ? getAuthErrorMessage(result.code, tr ? "tr" : "en") : result.message);
      else router.push("/login");
    } catch {
      setMessage(getAuthErrorMessage("network_error", tr ? "tr" : "en"));
    } finally {
      setBusy(false);
    }
  }

  return <AuthLayout eyebrow={tr ? "Yeni şifre" : "New password"}><h1 className="mt-4 font-serif text-4xl">{tr ? "Yeni şifrenizi oluşturun." : "Create your new password."}</h1><p className="mt-4 text-sm leading-6 text-ink/55">{tr ? "Bağlantı doğrulandıktan sonra hesabınız için yeni bir şifre belirleyin." : "After the link is verified, choose a new password for your account."}</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-bold text-ink/85">{tr ? "Yeni şifre" : "New password"}<input required name="password" type="password" autoComplete="new-password" className="mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-white/60 px-4 outline-none transition focus:border-wine/45 focus:ring-4 focus:ring-wine/8" /></label>{message && <div role="status" className="rounded-xl border border-wine/15 bg-wine/5 p-3 text-sm text-wine">{message}</div>}<PremiumButton type="submit" disabled={busy} ariaBusy={busy} className="h-14 w-full">{busy ? (tr ? "Kaydediliyor…" : "Saving…") : (tr ? "Şifreyi güncelle" : "Update password")}</PremiumButton></form></AuthLayout>;
}
