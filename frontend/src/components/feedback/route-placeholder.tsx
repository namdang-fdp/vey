import { FileText } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";
export function RoutePlaceholder({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="t-step-enter mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
      <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
        <FileText aria-hidden="true" className="size-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Vey · Legal
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <div className="mt-5 space-y-6">
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
      <div className="mt-10 border-t border-border pt-5">
        <Link
          href={routes.login}
          className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to sign in
        </Link>
      </div>
    </section>
  );
}
