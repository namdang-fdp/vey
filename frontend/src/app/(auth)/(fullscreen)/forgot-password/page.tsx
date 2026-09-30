import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/login-view";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password — Vey" };

export default function ForgotPasswordPage() {
  return (
    <LoginView label="Forgot password">
      <ForgotPasswordForm />
    </LoginView>
  );
}
