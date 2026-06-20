import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthForm } from "@/components/AuthForm";
export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout eyebrow="Reset your password"><AuthForm mode="forgot" /></AuthLayout>; }
