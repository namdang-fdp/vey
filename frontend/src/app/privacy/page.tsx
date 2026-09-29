import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/feedback/route-placeholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Vey handles account and product information.",
};

export default function PrivacyPage() {
  return (
    <RoutePlaceholder
      title="Privacy Policy"
      description="Privacy policy documentation will be published before production launch."
    />
  );
}
