import type { Metadata } from "next";
export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="text-muted-foreground">
        Settings will appear when account features are available.
      </p>
    </section>
  );
}
