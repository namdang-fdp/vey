import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { FadeIn } from "./fade-in";
import { BrandLogo } from "@/components/brand/brand-logo";

export interface LoginViewProps {
  children?: React.ReactNode;
  label?: string;
}

export function LoginView({ children, label = "Sign in" }: LoginViewProps) {
  return (
    <main className="min-h-dvh bg-auth-background text-foreground antialiased">
      <div className="flex min-h-screen">
        {/* Left column: Authentication surface */}
        <div className="relative flex min-h-screen w-full flex-col lg:w-1/2">
          <header className="absolute top-6 left-6 z-10 sm:top-8 sm:left-8 lg:left-12">
            <Link href="/" aria-label="Vey home">
              <BrandLogo />
            </Link>
          </header>
          <div className="mx-auto flex min-h-screen w-full max-w-140 flex-col justify-center px-6 pt-28 pb-12 sm:px-12 sm:pb-16 lg:px-16">
            <section
              aria-label={label}
              className="relative mx-auto w-full max-w-100"
            >
              <FadeIn duration={0.25}>{children}</FadeIn>
            </section>
          </div>
        </div>

        <aside
          aria-hidden="true"
          className="relative hidden min-h-screen lg:block lg:w-1/2 p-3"
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl bg-auth-visual">
            <Image
              src="/images/auth-artwork.webp"
              alt=""
              fill
              loading="eager"
              sizes="50vw"
              className="object-cover"
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
