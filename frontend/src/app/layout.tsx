import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/config/site";
import { AppProviders } from "@/providers/app-providers";

const albertSans = localFont({
  src: [
    {
      path: "../assets/fonts/albert-sans/albert-sans-variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../assets/fonts/albert-sans/albert-sans-italic-variable.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-albert-sans",
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${albertSans.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:p-3"
          >
            Skip to content
          </a>
          <header className="border-b border-border bg-card">
            <nav
              aria-label="Main navigation"
              className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4"
            >
              <Link
                href="/"
                className="mr-auto text-xl font-semibold tracking-tight"
              >
                Vey
              </Link>
              <Link href="/" className="text-sm hover:underline">
                Home
              </Link>
              <Link href="/meetings" className="text-sm hover:underline">
                Meetings
              </Link>
              <Link href="/settings" className="text-sm hover:underline">
                Settings
              </Link>
            </nav>
          </header>
          <main id="main-content" className="mx-auto max-w-5xl px-5 py-12">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
