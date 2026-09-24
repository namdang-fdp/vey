import { z } from "zod";

const environmentSchema = z.object({
  apiBaseUrl: z.url().default("http://localhost:8081"),
});

export function getEnvironment() {
  return environmentSchema.parse({
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || undefined,
  });
}
