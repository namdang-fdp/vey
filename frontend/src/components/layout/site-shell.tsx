import Link from "next/link";
import { site } from "@/config/site";
import { routes } from "@/config/routes";
import { BrandLogo } from "@/components/brand/brand-logo";
export function SiteShell({
  children,
  navigation,
  label,
}: {
  children: React.ReactNode;
  navigation: readonly { label: string; href: string }[];
  label: string;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-4 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <header className="border-b border-border bg-surface/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href={routes.home} aria-label={`${site.name} home`}>
            <BrandLogo />
          </Link>
          <nav aria-label={label} className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-[var(--duration-quick)] hover:bg-primary-subtle hover:text-on-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8 sm:py-16"
      >
        {children}
      </main>
    </>
  );
}
