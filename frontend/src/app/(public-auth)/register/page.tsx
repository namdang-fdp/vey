import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/forms/register-form";
import { safeReturnTo } from "@/features/auth/paths";

export const metadata: Metadata = {
  title: "Register",
};

export default async function RegisterPage({
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
  return <RegisterForm returnTo={returnTo} />;
}
