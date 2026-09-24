"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApiClient } from "@/lib/api/client";
import { getApiHealth } from "@/lib/api/health";

export function ConnectionStatus() {
  const query = useQuery({
    queryKey: ["infrastructure", "health"],
    queryFn: () => getApiHealth(createBrowserApiClient()),
    retry: false,
  });
  const state = query.isPending
    ? "Checking API connection…"
    : query.isError
      ? "API unavailable"
      : "API connected";
  return (
    <p role="status" className="text-sm text-muted-foreground">
      {state}
    </p>
  );
}
