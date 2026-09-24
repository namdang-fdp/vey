import { z } from "zod";
import type { ApiClient } from "./types";

export const healthResponse = z.object({
  code: z.literal(1000),
  result: z.object({ service: z.literal("vey-api"), status: z.literal("UP") }),
});

export function getApiHealth(client: ApiClient) {
  return client.request("/api/v1/health", { decode: healthResponse.parse });
}
