import { ConnectionStatus } from "@/components/health/connection-status";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Vey workspace</h1>
        <p className="max-w-2xl text-muted-foreground">
          Your meeting workspace is taking shape.
        </p>
      </div>
      <ConnectionStatus />
    </section>
  );
}
