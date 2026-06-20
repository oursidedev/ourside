"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Download, Globe2, LogOut, ShieldCheck, Trash2, Unplug, UserRound, UsersRound, X } from "lucide-react";
import { PartnerInviteCard } from "@/components/PartnerInviteCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { authService } from "@/features/auth/auth.service";
import { useCoupleAccess } from "@/features/couples/CoupleAccessProvider";
import { settingsService, type Preferences } from "@/features/settings/settings.service";
import { useLocale } from "@/i18n/LocaleProvider";
import { BillingSettingsCard } from "@/features/billing/components/BillingSettingsCard";
import { useToast } from "@/components/ui/ToastProvider";
import { NotificationSettings } from "@/features/notifications/components/NotificationSettings";
import { ProfileManagementCard } from "@/features/users/components/ProfileManagementCard";
import { AccountSecurityCard } from "@/features/users/components/AccountSecurityCard";

const defaults: Preferences = { memory_reminders: true, important_dates: true, letter_unlocks: true, theme: "light", date_format: "regional" };

export default function Settings() {
  const router = useRouter();
  const { locale } = useLocale();
  const { state, refresh } = useCoupleAccess();
  const tr = locale === "tr";
  const { toast } = useToast();
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [preferences, setPreferences] = useState(defaults);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"disconnect" | "delete" | null>(null);

  useEffect(() => {
    settingsService.getPreferences().then((result) => { if (result.ok) { setPreferences(result.data); applyTheme(result.data.theme); } });
  }, []);

  useEffect(() => { if (state?.ok) { setCoupleName(state.coupleName || ""); setStartDate(state.startDate || ""); } }, [state]);

  function applyTheme(theme: Preferences["theme"]) {
    localStorage.setItem("ourside-theme", theme);
    const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }

  async function run(action: () => Promise<{ ok: boolean; message?: string }>, success: string) {
    setBusy(true); setMessage(""); const result = await action(); setBusy(false);
    const feedback = result.ok ? success : result.message || (tr ? "İşlem tamamlanamadı." : "The action could not be completed.");
    setMessage(feedback);
    toast(feedback, result.ok ? "success" : "error");
    return result.ok;
  }

  async function saveCouple(event: FormEvent) { event.preventDefault(); const ok = await run(() => settingsService.updateCouple(coupleName, startDate), tr ? "Ourside bilgileriniz güncellendi." : "Your Ourside details were updated."); if (ok) await refresh(); }
  async function updatePreference(values: Partial<Preferences>) { const next = { ...preferences, ...values }; setPreferences(next); if (values.theme) applyTheme(values.theme); await run(() => settingsService.updatePreferences(values), tr ? "Tercihiniz kaydedildi." : "Your preference was saved."); }

  async function confirmDanger() {
    if (!confirmAction) return;
    const action = confirmAction; setConfirmAction(null);
    const ok = action === "disconnect"
      ? await run(() => settingsService.disconnectPartner(), tr ? "Partner bağlantısı kaldırıldı." : "Partner access was disconnected.")
      : await run(() => settingsService.deleteAccount(), tr ? "Hesabınız silindi." : "Your account was deleted.");
    if (ok) { if (action === "delete") { await authService.signOut(); router.replace("/"); } else { await refresh(); router.replace("/dashboard"); } }
  }

  return <div className="mx-auto max-w-5xl"><header><p className="eyebrow">{tr ? "Alanınız, kurallarınız" : "Your space, your rules"}</p><h1 className="mt-2 font-serif text-5xl">{tr ? "Ayarlar" : "Settings"}</h1><p className="mt-2 text-sm text-ink/50">{tr ? "Birlikte paylaştığınız özel dünyayı yönetin." : "Manage the private world you share."}</p></header>{message && <div role="status" className="mt-6 rounded-xl border border-wine/15 bg-paper p-4 text-sm text-wine">{message}</div>}<div className="mt-9 grid gap-5 lg:grid-cols-2">
    <ProfileManagementCard onChanged={refresh}/>
    <AccountSecurityCard/>
    <SettingsCard icon={UsersRound} title={tr ? "Ourside bilgileriniz" : "Your Ourside"}><form onSubmit={saveCouple} className="space-y-4"><Input label={tr ? "Alan adı" : "Space name"} value={coupleName} onChange={setCoupleName} disabled={!state?.ok || !state.hasCouple} /><Input label={tr ? "İlişki başlangıç tarihi" : "Relationship start date"} type="date" value={startDate} onChange={setStartDate} disabled={!state?.ok || !state.hasCouple} /><PremiumButton type="submit" disabled={busy || !state?.ok || !state.hasCouple}>{tr ? "Ourside’ı kaydet" : "Save Ourside"}</PremiumButton></form></SettingsCard>
    <SettingsCard icon={Bell} title={tr ? "Bildirimler" : "Notifications"}><div className="space-y-2"><Toggle label={tr ? "Anı hatırlatıcıları" : "Memory reminders"} checked={preferences.memory_reminders} onChange={(value) => updatePreference({ memory_reminders: value })} /><Toggle label={tr ? "Önemli tarihler" : "Important dates"} checked={preferences.important_dates} onChange={(value) => updatePreference({ important_dates: value })} /><Toggle label={tr ? "Mektup açılışları" : "Letter unlocks"} checked={preferences.letter_unlocks} onChange={(value) => updatePreference({ letter_unlocks: value })} /></div></SettingsCard>
    <SettingsCard icon={Globe2} title={tr ? "Dil ve görünüm" : "Language & appearance"}><div className="flex items-center justify-between"><span className="text-sm font-semibold">{tr ? "Dil" : "Language"}</span><LanguageSwitcher /></div><div className="mt-5"><p className="mb-3 text-sm font-semibold">{tr ? "Tema" : "Theme"}</p><div className="grid grid-cols-3 gap-2">{(["light", "dark", "system"] as const).map((theme) => <button type="button" key={theme} onClick={() => updatePreference({ theme })} className={`min-h-11 rounded-xl border px-3 text-xs font-bold capitalize ${preferences.theme === theme ? "bg-wine text-white" : "bg-cream"}`}>{theme === "light" ? (tr ? "Açık" : "Light") : theme === "dark" ? (tr ? "Koyu" : "Dark") : (tr ? "Sistem" : "System")}</button>)}</div></div></SettingsCard>
    <BillingSettingsCard />
    <NotificationSettings />
  </div><PartnerInviteCard /><section className="mt-5 rounded-[1.5rem] border border-wine/15 bg-gradient-to-br from-paper to-[#f3e7e3] p-6 shadow-card"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wine text-white"><ShieldCheck className="h-5 w-5" /></span><div><p className="eyebrow">{tr ? "Gizlilik" : "Privacy"}</p><h2 className="mt-1 font-serif text-3xl">{tr ? "Anılarınız özeldir." : "Your memories are private."}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">{tr ? "Yalnızca siz ve partneriniz görebilir. İçerikleriniz herkese açık veya aranabilir değildir." : "Only you and your partner can see them. Your content is never public or searchable."}</p></div></div></section>
  <section className="mt-5 rounded-[1.5rem] border bg-paper p-6 shadow-card"><h2 className="font-serif text-2xl">{tr ? "Veriler ve hesap" : "Data & account"}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><ActionButton icon={Download} label={tr ? "Tüm verileri dışa aktar" : "Export all data"} onClick={() => run(() => settingsService.exportData(), tr ? "Dışa aktarma hazırlandı." : "Your export is ready.")} /><ActionButton icon={LogOut} label={tr ? "Çıkış yap" : "Sign out"} onClick={async () => { await authService.signOut(); router.replace("/"); }} /><ActionButton icon={Unplug} label={tr ? "Partner bağlantısını kaldır" : "Disconnect partner"} tone="warning" onClick={() => setConfirmAction("disconnect")} /><ActionButton icon={Trash2} label={tr ? "Hesabı sil" : "Delete account"} tone="danger" onClick={() => setConfirmAction("delete")} /></div></section>
  {confirmAction && <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/45 p-5 backdrop-blur-sm" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.5rem] bg-paper p-6 shadow-warm"><button type="button" aria-label={tr ? "Kapat" : "Close"} onClick={() => setConfirmAction(null)} className="ml-auto grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5"><X /></button><h2 className="font-serif text-3xl">{confirmAction === "delete" ? (tr ? "Hesabınızı silmek istiyor musunuz?" : "Delete your account?") : (tr ? "Partner bağlantısını kaldıralım mı?" : "Disconnect your partner?")}</h2><p className="mt-3 text-sm leading-6 text-ink/55">{confirmAction === "delete" ? (tr ? "Bu işlem geri alınamaz. Hesabınız ve size ait erişim kalıcı olarak silinir." : "This cannot be undone. Your account and access will be permanently removed.") : (tr ? "Partneriniz ortak alana erişimini kaybeder ve özellikler yeniden kilitlenir." : "Your partner will lose access and shared features will lock again.")}</p><div className="mt-6 flex gap-3"><PremiumButton variant="secondary" onClick={() => setConfirmAction(null)} className="flex-1">{tr ? "Vazgeç" : "Cancel"}</PremiumButton><button type="button" onClick={confirmDanger} className="focus-ring min-h-12 flex-1 rounded-full bg-red-700 px-5 text-sm font-bold text-white">{tr ? "Onayla" : "Confirm"}</button></div></div></div>}
  </div>;
}

function SettingsCard({ icon: Icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) { return <section className="rounded-[1.5rem] border bg-paper p-6 shadow-card"><div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-wine/8 text-wine"><Icon className="h-5 w-5" /></span><h2 className="font-serif text-2xl">{title}</h2></div>{children}</section>; }
function Input({ label, value, onChange, type = "text", placeholder, disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean }) { return <label className="block text-sm font-semibold">{label}<input required={type !== "password"} disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border bg-cream px-4 outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/10 disabled:opacity-50" /></label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl px-2 hover:bg-cream"><span className="text-sm font-semibold">{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-wine" /></label>; }
function ActionButton({ icon: Icon, label, onClick, tone }: { icon: typeof Download; label: string; onClick: () => void; tone?: "warning" | "danger" }) { return <button type="button" onClick={onClick} className={`focus-ring flex min-h-14 items-center gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition hover:bg-cream ${tone === "danger" ? "text-red-700" : tone === "warning" ? "text-amber-800" : ""}`}><Icon className="h-4 w-4" />{label}</button>; }
