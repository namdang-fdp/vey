import { z } from "zod";
import type { ApiClient } from "./types";

export const veyApiResponse = <T extends z.ZodType>(result: T) =>
  z.object({ code: z.number(), message: z.string(), result });

export const healthResponse = veyApiResponse(
  z.object({ service: z.literal("vey-api"), status: z.literal("UP") }),
).extend({ code: z.literal(1000) });

export function getApiHealth(client: ApiClient) {
  return client.request("/api/v1/health", { decode: healthResponse.parse });
}
