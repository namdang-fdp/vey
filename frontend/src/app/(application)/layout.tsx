import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ApplicationNavigation } from "@/components/shell/application-navigation";
import { SignOutControl } from "@/features/auth/components/sign-out-control";

export default async function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await auth.protect();

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[14.5rem_minmax(0,1fr)]">
      <aside className="hidden min-h-dvh flex-col border-r border-border bg-muted/60 px-3 py-4 md:flex">
        <Link
          href="/meetings"
          className="mb-7 flex h-9 items-center px-2 text-base font-semibold tracking-tight outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandLogo />
        </Link>
        <ApplicationNavigation />
        <div className="mt-auto border-t border-border pt-3">
          <SignOutControl />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-surface px-4 md:hidden">
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
          className="min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
