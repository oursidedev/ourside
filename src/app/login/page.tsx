import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthForm } from "@/components/AuthForm";
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout eyebrow="Welcome back"><AuthForm mode="login" /></AuthLayout>; }
