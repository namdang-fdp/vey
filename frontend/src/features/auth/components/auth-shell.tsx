import * as React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthVisualPanel } from "./auth-visual-panel";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full bg-auth-background text-foreground antialiased selection:bg-primary-subtle selection:text-on-primary-subtle">
      {/* Left side: Auth Form container (46-48% on desktop) */}
      <div className="flex min-h-dvh w-full flex-col justify-between px-5 py-6 sm:px-8 lg:w-[48%] xl:w-[46%] lg:px-12 lg:py-8">
        {/* Brand header */}
        <header className="flex items-center">
          <Link
            href="/"
            className="group flex items-center gap-2.5 outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Vey home"
          >
            <BrandLogo markClassName="transition-transform duration-150 ease-out group-hover:scale-[1.03]" />
          </Link>
        </header>

        {/* Center: Main Form */}
        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-6 sm:py-8 t-auth-form-enter"
        >
          {children}
        </main>

        {/* Footer: Legal Notice */}
        <footer className="pt-4 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to Vey&apos;s Terms of Service and
          acknowledge our Privacy Policy.
        </footer>
      </div>

      {/* Right side: Editorial visual panel (52-54% on desktop, hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 p-3 xl:p-4">
        <AuthVisualPanel />
      </div>
    </div>
  );
}
