import type { Metadata } from "next";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthForm } from "@/components/AuthForm";
export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };
export default function Page() { return <AuthLayout><AuthForm mode="signup" /></AuthLayout>; }
