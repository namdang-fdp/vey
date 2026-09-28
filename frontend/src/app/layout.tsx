import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
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
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${albertSans.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ClerkProvider afterSignOutUrl="/login">
          <AppProviders>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:p-3"
            >
              Skip to content
            </a>
            {children}
          </AppProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
