import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/features/auth/forms/forgot-password-form";
import { safeReturnTo } from "@/features/auth/paths";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ForgotPasswordPage({
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
  return <ForgotPasswordForm returnTo={returnTo} />;
}
