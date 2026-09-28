import type { Metadata } from "next";
import { SsoCallback } from "@/features/auth/sso-callback";

export const metadata: Metadata = {
  title: "Signing in",
};

export default async function SsoCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  return <SsoCallback returnTo={(await searchParams).returnTo} />;
}
