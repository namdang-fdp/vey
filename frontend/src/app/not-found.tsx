import Link from "next/link";
import { routes } from "@/config/routes";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <Link
        href={routes.home}
        aria-label="Vey home"
        className="mb-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BrandLogo />
      </Link>
      <section className="t-step-enter w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
          <Compass aria-hidden="true" className="size-6" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          This page may have moved, or the address may be incorrect. Let&apos;s
          get you back to Vey.
        </p>
        <Button asChild className="mt-7 h-12 w-full rounded-xl">
          <Link href={routes.home}>Return home</Link>
        </Button>
      </section>
    </main>
  );
}
