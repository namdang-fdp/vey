import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account setup required",
};

export default function SessionTaskPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center bg-auth-background px-4 py-8 sm:px-6"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xs sm:p-8 t-auth-form-enter">
        <div className="space-y-3 text-center">
          <BrandLogo markOnly className="mx-auto" markClassName="h-10" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Account setup required
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your session has a pending account task that needs to be completed
            in Clerk before you can access your Vey workspace.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button asChild size="lg" className="px-4 text-[0.8125rem]">
            <Link href="/login">Return to sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
