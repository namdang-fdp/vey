import { ApplicationShell } from "@/components/layout/application-shell";
import { SignOutControl } from "@/features/auth/components/sign-out-control";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { getVeySession } from "@/features/auth/api/session.server";

export default async function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getVeySession();
  if (!session) {
    const identity = await auth.api.getSession({ headers: await headers() });
    redirect(identity ? routes.authComplete : routes.login);
  }

  return (
    <ApplicationShell
      user={session.user}
      desktopAccountAction={<SignOutControl />}
      mobileAccountAction={<SignOutControl compact />}
    >
      {children}
    </ApplicationShell>
  );
}
