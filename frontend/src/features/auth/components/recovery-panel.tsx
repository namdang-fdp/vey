import type { ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
export function RecoveryPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="w-full">
      <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-tight sm:text-[30px]">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children}
      <Link
        href={routes.login}
        className="mt-6 inline-flex min-h-11 items-center rounded-md text-sm font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back to sign in
      </Link>
    </div>
  );
}
