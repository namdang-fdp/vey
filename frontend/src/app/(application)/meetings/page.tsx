import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meetings" };

export default function MeetingsPage() {
  return (
    <section className="t-step-enter mx-auto max-w-6xl">
      <header className="mb-8 sm:mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Your workspace
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Meetings
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A place for your meetings and the decisions that follow.
        </p>
      </header>
      <div className="flex min-h-72 flex-col justify-center border-t border-border py-12 sm:min-h-80">
        <h2 className="text-xl font-semibold tracking-tight">
          No meetings yet.
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your meeting history will appear here when meetings are available in
          your workspace.
        </p>
      </div>
    </section>
  );
}
