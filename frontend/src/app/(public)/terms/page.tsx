import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/feedback/route-placeholder";
import { SiteShell } from "@/components/layout/site-shell";
import { publicNavigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Review the terms that apply to using Vey.",
};

export default function TermsPage() {
  return (
    <SiteShell navigation={publicNavigation} label="Legal">
      <RoutePlaceholder
        title="Terms of Service"
        description="Terms of service documentation will be published before production launch."
      />
    </SiteShell>
  );
}
