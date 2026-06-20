"use client";

import { FormEvent, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa6";
import { PremiumButton } from "./ui/PremiumButton";
import { authService } from "@/features/auth/auth.service";
import { useLocale } from "@/i18n/LocaleProvider";
import { passwordSchema } from "@/lib/validations/schemas";
import { runtimeAppUrl } from "@/config/brand";

type Mode = "login" | "signup" | "forgot";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const tr = locale === "tr";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [oauth, setOauth] = useState<{ google: boolean; apple: boolean } | null>(null);

  useEffect(() => {
    authService.getOAuthAvailability().then(setOauth);
    if (new URLSearchParams(location.search).get("error") === "oauth") {
      setMessage(tr ? "Sosyal giriş tamamlanamadı. Lütfen tekrar deneyin." : "Social sign-in could not be completed. Please try again.");
    }
  }, [tr]);

  const requestedNext = searchParams.get("next");
  const nextPath = () => requestedNext || (mode === "signup" ? "/onboarding" : "/dashboard");
  const preservedQuery = requestedNext ? `?next=${encodeURIComponent(requestedNext)}` : "";
  const copy = {
    login: tr
      ? ["Hikâyenize yeniden hoş geldiniz.", "E-posta adresiniz ve şifrenizle güvenli şekilde giriş yapın."]
      : ["Welcome back to your story.", "Sign in securely with your email address and password."],
    signup: tr
      ? ["İkiniz için bir yer açın.", "Güçlü bir şifreyle hesabınızı oluşturun, ardından e-posta adresinizi doğrulayın."]
      : ["Make a place for the two of you.", "Create your account with a strong password, then verify your email address."],
    forgot: tr
      ? ["Yolunuzu yeniden bulun.", "Güvenli şifre sıfırlama bağlantısını e-posta adresinize göndereceğiz."]
      : ["Find your way back.", "We’ll send a secure password reset link to your inbox."],
  }[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const pass = String(data.get("password") || "");

    if (mode === "signup" && !passwordSchema.safeParse(pass).success) {
      setBusy(false);
      setMessage(tr ? "Lütfen tüm şifre kurallarını tamamlayın." : "Please complete every password requirement.");
      return;
    }

    const result = mode === "signup"
      ? await authService.signUp({
          firstName: String(data.get("firstName") || "").trim(),
          lastName: String(data.get("lastName") || "").trim(),
          email,
          password: pass,
          redirectTo: runtimeAppUrl(`/auth/callback?next=${encodeURIComponent(nextPath())}`),
        })
      : mode === "login"
        ? await authService.signIn({ email, password: pass })
        : await authService.resetPassword(email);

    setBusy(false);
    if (!result.ok) {
      setMessage(result.code === "email_exists"
        ? (tr ? "Bu e-posta adresiyle zaten bir hesap var. Lütfen giriş yapın veya şifrenizi sıfırlayın." : "An account already exists with this email address. Please sign in or reset your password.")
        : result.message);
      return;
    }

    if (mode === "signup") {
      if (result.requiresEmailConfirmation) setConfirmationEmail(email);
      else router.push(nextPath());
    }
    else if (mode === "login") router.push(nextPath());
    else setMessage(tr ? "Şifre sıfırlama bağlantısı gönderildi." : "A secure reset link is on its way.");
  }

  async function socialSignIn(provider: "google" | "apple") {
    if (busy) return;
    if (oauth && !oauth[provider]) {
      setMessage(provider === "google"
        ? (tr ? "Google girişi henüz Supabase’te etkinleştirilmedi. Google OAuth Client ID ve Secret eklenmelidir." : "Google sign-in is not enabled in Supabase yet. A Google OAuth Client ID and Secret are required.")
        : (tr ? "Apple girişi henüz Supabase’te etkinleştirilmedi. Apple Developer Service ID ve özel anahtar eklenmelidir." : "Apple sign-in is not enabled in Supabase yet. An Apple Developer Service ID and private key are required."));
      return;
    }
    setBusy(true);
    setMessage(null);
    const destination = nextPath();
    const callback = runtimeAppUrl(`/auth/callback?next=${encodeURIComponent(destination)}`);
    const result = await authService.signInWithOAuth(provider, callback);
    if (!result.ok) {
      setBusy(false);
      setMessage(result.message);
    }
  }

  if (confirmationEmail) {
    return <EmailConfirmationStep email={confirmationEmail} tr={tr} destination={nextPath()} />;
  }

  return (
    <>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{copy[0]}</h1>
      <p className="mt-4 text-sm leading-6 text-ink/55">{copy[1]}</p>

      {mode !== "forgot" && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <SocialButton icon={FcGoogle} label="Google" disabled={busy} onClick={() => socialSignIn("google")} />
            <SocialButton icon={FaApple} label="Apple" disabled={busy} onClick={() => socialSignIn("apple")} />
          </div>
          <div className="my-7 flex items-center gap-4 text-xs text-ink/35">
            <span className="h-px flex-1 bg-ink/10" />
            {tr ? "veya e-posta ile devam edin" : "or continue with email"}
            <span className="h-px flex-1 bg-ink/10" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={mode === "forgot" ? "mt-8 space-y-5" : "space-y-5"}>
        {mode === "signup" && <div className="grid gap-4 sm:grid-cols-2">
          <Field label={tr ? "Adınız" : "First name"} name="firstName" type="text" autoComplete="given-name" placeholder={tr ? "Adınız" : "First name"} icon={UserRound} />
          <Field label={tr ? "Soyadınız" : "Last name"} name="lastName" type="text" autoComplete="family-name" placeholder={tr ? "Soyadınız" : "Last name"} icon={UserRound} />
        </div>}
        <Field label={tr ? "E-posta adresi" : "Email address"} name="email" type="email" autoComplete="email" placeholder="you@example.com" icon={Mail} />
        {mode !== "forgot" && (
          <>
            <Field
              label={tr ? "Şifre" : "Password"}
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? (tr ? "Güçlü bir şifre oluşturun" : "Create a strong password") : (tr ? "Şifrenizi girin" : "Enter your password")}
              icon={LockKeyhole}
              onValue={mode === "signup" ? setPassword : undefined}
            />
            {mode === "signup" && <PasswordRules value={password} tr={tr} />}
          </>
        )}
        {mode === "login" && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-ink/55">
              <input type="checkbox" className="h-4 w-4 accent-wine" />
              {tr ? "Oturumumu açık tut" : "Keep me signed in"}
            </label>
            <Link href="/forgot-password" className="inline-flex min-h-11 items-center font-bold text-wine hover:underline">{tr ? "Şifrenizi mi unuttunuz?" : "Forgot password?"}</Link>
          </div>
        )}
        {message && <div role="status" className="rounded-xl border border-wine/15 bg-wine/5 p-3 text-sm text-wine">{message}</div>}
        <PremiumButton type="submit" disabled={busy} ariaBusy={busy} className="h-14 w-full">
          {busy ? (tr ? "Lütfen bekleyin…" : "Please wait…") : mode === "login" ? (tr ? "Giriş yap" : "Sign in") : mode === "signup" ? (tr ? "Hesabımı oluştur" : "Create my account") : (tr ? "Sıfırlama bağlantısı gönder" : "Send reset link")}
        </PremiumButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink/55">
        {mode === "login" ? <>{tr ? "Burada yeni misiniz? " : "New here? "}<Link href={`/signup${preservedQuery}`} className="font-bold text-wine">{requestedNext ? (tr ? "Hesap oluşturun" : "Create an account") : (tr ? "Ourside’ınızı oluşturun" : "Create your Ourside")}</Link></>
          : mode === "signup" ? <>{tr ? "Zaten bir hesabınız var mı? " : "Already have an account? "}<Link href={`/login${preservedQuery}`} className="font-bold text-wine">{tr ? "Giriş yapın" : "Sign in"}</Link></>
            : <Link href="/login" className="font-bold text-wine">{tr ? "← Girişe dön" : "← Back to sign in"}</Link>}
      </p>
    </>
  );
}

function EmailConfirmationStep({ email, tr, destination }: { email: string; tr: boolean; destination: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    setBusy(true);
    setMessage(null);
    const result = await authService.resendSignupConfirmation(email, runtimeAppUrl(`/auth/callback?next=${encodeURIComponent(destination)}`));
    setBusy(false);
    setMessage(result.ok
      ? (tr ? "Doğrulama e-postası yeniden gönderildi." : "The verification email has been sent again.")
      : result.message);
  }

  return (
    <div aria-live="polite">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-wine/10 text-wine"><Mail /></div>
      <h1 className="mt-5 font-serif text-4xl">{tr ? "E-postanızı doğrulayın." : "Verify your email."}</h1>
      <p className="mt-3 text-sm leading-6 text-ink/55">
        {tr ? `${email} adresine bir doğrulama bağlantısı gönderdik. Hesabınızı etkinleştirmek için e-postadaki bağlantıya tıklayın.` : `We sent a verification link to ${email}. Click the link in the email to activate your account.`}
      </p>
      <div className="mt-7 rounded-2xl border border-wine/10 bg-wine/5 p-4 text-sm leading-6 text-ink/65">
        {tr ? "E-posta görünmüyorsa spam veya gereksiz klasörünü kontrol edin." : "If you cannot see it, check your spam or junk folder."}
      </div>
      {message && <div role="status" className="mt-4 rounded-xl border border-wine/15 bg-white p-3 text-sm text-wine">{message}</div>}
      <PremiumButton type="button" variant="secondary" disabled={busy} ariaBusy={busy} onClick={resend} className="mt-5 w-full">
        {busy ? (tr ? "Gönderiliyor…" : "Sending…") : (tr ? "Doğrulama e-postasını yeniden gönder" : "Resend verification email")}
      </PremiumButton>
      <Link href="/login" className="mt-5 block text-center text-sm font-bold text-wine hover:underline">{tr ? "Giriş sayfasına dön" : "Back to sign in"}</Link>
    </div>
  );
}

function PasswordRules({ value, tr }: { value: string; tr: boolean }) {
  const rules = [
    [value.length >= 8, tr ? "En az 8 karakter" : "At least 8 characters"],
    [/[A-ZÇĞİÖŞÜ]/.test(value), tr ? "Bir büyük harf" : "One uppercase letter"],
    [/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(value), tr ? "Bir özel karakter" : "One special character"],
  ] as const;
  return <div className="grid gap-2 rounded-2xl border border-ink/8 bg-cream/55 p-4 sm:grid-cols-3">{rules.map(([ok, label]) => <div key={label} className={`flex items-center gap-2 text-xs font-semibold transition ${ok ? "text-emerald-700" : "text-ink/40"}`}><span className={`grid h-5 w-5 place-items-center rounded-full transition ${ok ? "bg-emerald-100" : "bg-ink/5"}`}>{ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}</span>{label}</div>)}</div>;
}

function SocialButton({ icon: Icon, label, disabled, onClick }: { icon: ComponentType<{ className?: string }>; label: string; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="focus-ring flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-ink/10 bg-white/55 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-card disabled:pointer-events-none disabled:opacity-50"><Icon className="h-5 w-5" />{label}</button>;
}

function Field({ label, name, type, autoComplete, placeholder, icon: Icon, onValue }: { label: string; name: string; type: string; autoComplete: string; placeholder: string; icon: ComponentType<{ className?: string }>; onValue?: (value: string) => void }) {
  const [show, setShow] = useState(false);
  const password = type === "password";
  return <label className="block text-sm font-bold text-ink/85">{label}<div className="group relative mt-2"><Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/30 group-focus-within:text-wine" /><input required name={name} type={password && show ? "text" : type} onChange={(event) => onValue?.(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} className="h-14 w-full rounded-2xl border border-ink/10 bg-white/60 pl-12 pr-14 text-[15px] font-medium outline-none transition placeholder:text-ink/30 focus:border-wine/45 focus:bg-white focus:ring-4 focus:ring-wine/8" />{password && <button type="button" onClick={() => setShow((current) => !current)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-ink/35 hover:bg-wine/5 hover:text-wine">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}</div></label>;
}
