import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/feedback/route-placeholder";
import { SiteShell } from "@/components/layout/site-shell";
import { publicNavigation } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Vey handles account and product information.",
};

export default function PrivacyPage() {
  return (
    <SiteShell navigation={publicNavigation} label="Legal">
      <RoutePlaceholder
        title="Privacy Policy"
        description="Privacy policy documentation will be published before production launch."
      />
    </SiteShell>
  );
}
