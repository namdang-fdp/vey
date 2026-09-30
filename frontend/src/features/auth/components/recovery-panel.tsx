import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/routes";

export function RecoveryPanel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="t-step-enter w-full overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_20px_60px_rgba(29,33,28,0.08)]">
      <div className="p-6 sm:p-8">
        <div
          className="mb-7 flex size-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary-subtle text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Account recovery
        </p>
        <h1 className="mt-3 text-[27px] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
      <div className="border-t border-border bg-muted/35 px-6 py-3 sm:px-8">
        <Link
          href={routes.login}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-quick)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export function RecoveryArrow() {
  return (
    <span className="t-learn-chevron" aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
        <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
      </svg>
    </span>
  );
}
