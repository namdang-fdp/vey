import "server-only";

import { headers } from "next/headers";
import { z } from "zod";
import { getApiBaseUrl } from "@/lib/api/config";

const contextSchema = z.object({
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    displayName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  activeWorkspace: z.object({
    id: z.uuid(),
    name: z.string(),
    type: z.enum(["PERSONAL", "TEAM"]),
  }),
  membership: z.object({ role: z.enum(["OWNER", "ADMIN", "MEMBER", "GUEST"]) }),
});
const responseSchema = z.object({
  code: z.literal(1000),
  result: contextSchema,
});
export type VeySession = z.infer<typeof contextSchema>;

export class WorkspaceAccessError extends Error {
  constructor() {
    super(
      "Your workspace is unavailable. Please sign out or contact its owner.",
    );
  }
}

export async function getVeySession(): Promise<VeySession | null> {
  const incoming = await headers();
  const cookie = incoming
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("vey_session="));
  if (!cookie || cookie === "vey_session=") return null;
  const baseUrl = process.env.VEY_API_INTERNAL_URL || getApiBaseUrl();
  if (!baseUrl) throw new Error("Vey API is not configured");
  const response = await fetch(new URL("/api/v1/auth/me", baseUrl).toString(), {
    headers: { Cookie: cookie },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 401) return null;
  if (response.status === 403) throw new WorkspaceAccessError();
  if (!response.ok) throw new Error("Unable to check your Vey session");
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Invalid Vey session response");
  return parsed.data.result;
}
