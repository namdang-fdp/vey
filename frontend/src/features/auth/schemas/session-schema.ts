import { z } from "zod";

export const veyContextSchema = z.object({
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
export const veySessionResponseSchema = z.object({
  code: z.literal(1000),
  result: veyContextSchema,
});
export type VeySession = z.infer<typeof veyContextSchema>;
