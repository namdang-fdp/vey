"use client";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/components/ui/goey-toaster";
import { NavigationFeedback } from "@/components/feedback/navigation-feedback";
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Toaster />
      <NavigationFeedback />
      {children}
    </QueryProvider>
  );
}
