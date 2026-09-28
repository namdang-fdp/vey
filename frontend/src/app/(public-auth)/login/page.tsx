import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/forms/login-form";
import { safeReturnTo } from "@/features/auth/paths";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const [{ isAuthenticated }, resolvedSearchParams] = await Promise.all([
    auth(),
    searchParams,
  ]);
  const returnTo = safeReturnTo(resolvedSearchParams.returnTo);
  if (isAuthenticated) redirect(returnTo);
  return <LoginForm returnTo={returnTo} />;
}
