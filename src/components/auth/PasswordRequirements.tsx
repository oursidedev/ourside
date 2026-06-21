"use client";

import { Check, X } from "lucide-react";

export function passwordChecks(value: string) {
  return {
    length: value.length >= 8,
    uppercase: /[A-ZÇĞİÖŞÜ]/.test(value),
    special: /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(value),
    lowercase: /[a-zçğıöşü]/.test(value),
    number: /\d/.test(value),
  };
}

export function PasswordRequirements({ value, tr }: { value: string; tr: boolean }) {
  const checks = passwordChecks(value);
  const required = [
    [checks.length, tr ? "En az 8 karakter" : "At least 8 characters"],
    [checks.uppercase, tr ? "Bir büyük harf" : "One uppercase letter"],
    [checks.special, tr ? "Bir özel karakter" : "One special character"],
  ] as const;
  const score = Object.values(checks).filter(Boolean).length;
  const strength = score <= 2
    ? (tr ? "Zayıf" : "Weak")
    : score === 3
      ? (tr ? "Orta" : "Medium")
      : score === 4
        ? (tr ? "Güçlü" : "Strong")
        : (tr ? "Çok güçlü" : "Excellent");

  return <div className="rounded-2xl border border-ink/8 bg-cream/55 p-4">
    <div className="flex items-center justify-between text-xs font-bold">
      <span>{tr ? "Şifre güvenliği" : "Password strength"}</span>
      <span className={score >= 4 ? "text-emerald-700" : "text-wine"}>{strength}</span>
    </div>
    <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((level) => <span key={level} className={`h-1.5 rounded-full ${score >= level ? (score >= 4 ? "bg-emerald-500" : "bg-wine") : "bg-ink/10"}`} />)}
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {required.map(([ok, label]) => <div key={label} className={`flex items-center gap-2 text-xs font-semibold ${ok ? "text-emerald-700" : "text-ink/45"}`}>
        <span className={`grid h-5 w-5 place-items-center rounded-full ${ok ? "bg-emerald-100" : "bg-ink/5"}`}>
          {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        </span>
        {label}
      </div>)}
    </div>
    <p className="mt-3 text-xs leading-5 text-ink/45">
      {tr ? "Küçük harf ve rakam eklemek şifrenizi daha da güçlendirir." : "Add lowercase letters and numbers for an even stronger password."}
    </p>
  </div>;
}
