import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ApplicationNavigation } from "@/components/shell/application-navigation";
import { SignOutControl } from "@/features/auth/components/sign-out-control";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default async function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(routes.login);

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-4 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <aside className="hidden min-h-dvh flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <Link
          href="/meetings"
          className="mb-9 flex h-10 items-center px-2 text-base font-semibold tracking-tight outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandLogo />
        </Link>
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Workspace
        </p>
        <ApplicationNavigation />
        <div className="mt-auto border-t border-border pt-5">
          <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-sm font-semibold text-on-primary-subtle"
            >
              {session.user.name?.trim().charAt(0).toUpperCase() || "V"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {session.user.name?.trim() || session.user.email}
              </p>
              <p
                className="truncate text-xs text-muted-foreground"
                title={session.user.email}
              >
                {session.user.email}
              </p>
            </div>
          </div>
          <SignOutControl />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
          <Link
            href="/meetings"
            className="text-base font-semibold tracking-tight outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <BrandLogo markOnly />
          </Link>
          <ApplicationNavigation compact />
          <div className="ml-auto">
            <SignOutControl compact />
          </div>
        </header>
        <main
          id="main-content"
          className="min-w-0 px-5 py-8 sm:px-8 md:px-10 md:py-12 lg:px-14"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
