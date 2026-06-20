import { AdminHeader, DataTable } from "@/components/admin/AdminUI";
import { getAdminIdentity, getAdminUsers } from "@/features/admin/admin.server";

export default async function AdminSettings() {
  const [identity, admins] = await Promise.all([getAdminIdentity(), getAdminUsers()]);
  return <>
    <AdminHeader
      title="Admin settings"
      description={`Signed in as ${identity?.email}. Only owners should change internal access roles.`}
    />
    <section className="mt-8 rounded-2xl border bg-paper p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider text-wine">Provider modes</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Status label="Billing" value={process.env.BILLING_PROVIDER || "mock"} />
        <Status label="App notification email" value={process.env.EMAIL_PROVIDER || "mock"} />
        <Status label="Analytics" value={process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false" ? "disabled" : "enabled"} />
      </div>
    </section>
    <section className="mt-5 rounded-2xl border border-amber-300/70 bg-amber-50 p-5 text-amber-950 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wider">Supabase Auth SMTP</p>
      <p className="mt-2 text-lg font-bold">Manual check required</p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900/75">
        The app cannot safely inspect SMTP credentials stored in Supabase Dashboard. If the built-in email provider is still active,
        signup and password reset emails can hit strict rate limits. Configure Resend custom SMTP before public beta.
      </p>
    </section>
    <DataTable rows={admins as unknown as Record<string, unknown>[]} />
  </>;
}

function Status({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-cream p-4"><p className="text-xs text-ink/40">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}
