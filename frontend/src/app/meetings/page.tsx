import type { Metadata } from "next";
export const metadata: Metadata = { title: "Meetings" };
export default function MeetingsPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold">Meetings</h1>
      <p className="text-muted-foreground">No meetings yet.</p>
    </section>
  );
}
