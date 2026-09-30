import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/login-view";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password — Vey" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <LoginView label="Reset password">
      <ResetPasswordForm token={token} invalidLink={Boolean(error)} />
    </LoginView>
  );
}
