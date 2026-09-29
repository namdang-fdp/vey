import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/login-view";
import { OAuthPreviewCard } from "@/features/auth/components/oauth-preview-card";

export const metadata: Metadata = {
  title: "Continue with GitHub — Vey",
  description:
    "Preview the GitHub sign-in handoff for Vey. OAuth is not connected yet.",
};

export default function GitHubOAuthPage() {
  return (
    <LoginView>
      <OAuthPreviewCard provider="github" />
    </LoginView>
  );
}
