"use client";

import { CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

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
      {navigationItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[0.8125rem] font-medium outline-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
              compact && "px-2 text-xs",
              isActive
                ? "bg-primary-subtle text-on-primary-subtle"
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
