import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/login-view";
import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Vey account.",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(routes.meetings);

  return (
    <LoginView>
      <LoginForm />
    </LoginView>
  );
}
