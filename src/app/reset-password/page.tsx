"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/AuthLayout";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { authService } from "@/features/auth/auth.service";
import { getAuthErrorMessage } from "@/features/auth/auth-errors";
import { passwordSchema } from "@/lib/validations/schemas";
import { useLocale } from "@/i18n/LocaleProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const tr = locale === "tr";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!passwordSchema.safeParse(password).success) {
      setMessage(tr ? "Devam etmek için tüm zorunlu şifre kurallarını tamamlayın." : "Complete every required password rule before continuing.");
      return;
    }
    if (password !== confirmation) {
      setMessage(tr ? "Şifreler birbiriyle eşleşmiyor." : "The passwords do not match.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const result = await authService.updatePassword(password);
      if (!result.ok) {
        setMessage(result.code ? getAuthErrorMessage(result.code, tr ? "tr" : "en") : result.message);
        return;
      }
      router.replace("/login?password=changed");
    } catch {
      setMessage(getAuthErrorMessage("network_error", tr ? "tr" : "en"));
    } finally {
      setBusy(false);
    }
  }

  return <AuthLayout eyebrow={tr ? "Yeni şifre" : "New password"}>
    <h1 className="mt-4 font-serif text-4xl">{tr ? "Yeni şifrenizi oluşturun." : "Create your new password."}</h1>
    <p className="mt-4 text-sm leading-6 text-ink/55">
      {tr ? "Güvenlik bağlantınız 30 dakika geçerlidir. Güçlü ve daha önce kullanmadığınız bir şifre seçin." : "Your secure link is valid for 30 minutes. Choose a strong password you have not used before."}
    </p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <PasswordField label={tr ? "Yeni şifre" : "New password"} name="password" value={password} onChange={setPassword} />
      <PasswordRequirements value={password} tr={tr} />
      <PasswordField label={tr ? "Yeni şifreyi tekrar girin" : "Confirm new password"} name="confirmation" value={confirmation} onChange={setConfirmation} />
      {confirmation && <p className={`text-xs font-semibold ${password === confirmation ? "text-emerald-700" : "text-wine"}`}>
        {password === confirmation ? (tr ? "Şifreler eşleşiyor." : "Passwords match.") : (tr ? "Şifreler henüz eşleşmiyor." : "Passwords do not match yet.")}
      </p>}
      {message && <div role="alert" className="rounded-xl border border-wine/15 bg-wine/5 p-3 text-sm text-wine">{message}</div>}
      <PremiumButton type="submit" disabled={busy} ariaBusy={busy} className="h-14 w-full">
        {busy ? (tr ? "Güvenli şekilde güncelleniyor…" : "Updating securely…") : (tr ? "Şifreyi güncelle" : "Update password")}
      </PremiumButton>
    </form>
    <p className="mt-5 text-center text-xs text-ink/45">
      {tr ? "Bağlantının süresi dolduysa " : "If the link expired, "}
      <Link href="/forgot-password" className="font-bold text-wine hover:underline">{tr ? "yeni bağlantı isteyin" : "request a new link"}</Link>.
    </p>
  </AuthLayout>;
}

function PasswordField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-sm font-bold text-ink/85">
    {label}
    <div className="group relative mt-2">
      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/30 group-focus-within:text-wine" />
      <input
        required
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        className="h-14 w-full rounded-2xl border border-ink/10 bg-white/60 pl-12 pr-14 text-[15px] font-medium outline-none transition focus:border-wine/45 focus:bg-white focus:ring-4 focus:ring-wine/8"
      />
      <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink/35 hover:bg-wine/5 hover:text-wine">
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </label>;
}
