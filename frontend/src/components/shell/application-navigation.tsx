"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { applicationNavigation } from "@/config/navigation";

export function ApplicationNavigation({
  compact = false,
}: {
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspace navigation"
      className={cn(compact ? "flex min-w-0 items-center gap-1" : "space-y-1")}
    >
      {applicationNavigation.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium outline-none transition-colors duration-[var(--duration-quick)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
              compact && "px-2 text-xs",
              isActive
                ? "bg-primary-subtle text-on-primary-subtle"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
