import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/login-view";
import { OAuthPreviewCard } from "@/features/auth/components/oauth-preview-card";

export const metadata: Metadata = {
  title: "Continue with Facebook — Vey",
  description:
    "Preview the Facebook sign-in handoff for Vey. OAuth is not connected yet.",
};

export default function FacebookOAuthPage() {
  return (
    <LoginView>
      <OAuthPreviewCard provider="facebook" />
    </LoginView>
  );
}
