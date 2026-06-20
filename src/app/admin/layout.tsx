import type { Metadata } from "next";import { notFound } from "next/navigation";import { AdminShell } from "@/components/admin/AdminShell";import { getAdminIdentity } from "@/features/admin/admin.server";
export const metadata:Metadata={title:{default:"Admin",template:"%s · Ourside Admin"},robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){const admin=await getAdminIdentity();if(!admin)notFound();return <AdminShell admin={admin}>{children}</AdminShell>}
