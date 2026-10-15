import "server-only";

import { randomUUID } from "node:crypto";
import type { BetterAuthOptions } from "better-auth";
import { APIError } from "better-auth/api";
import { getApiBaseUrl } from "@/lib/api/config";

type Revocation = {
  authUserId: string;
  authSessionId?: string;
  reason: "SESSION_REVOKED" | "PASSWORD_RESET";
};
type Revoke = (event: Revocation) => Promise<void>;

export function createIdentityRevoker(
  sign: (payload: Record<string, unknown>) => Promise<{ token: string }>,
): Revoke {
  return async (event) => {
    try {
      const occurredAt = Date.now();
      const issuedAt = Math.floor(occurredAt / 1000);
      const { token } = await sign({
        sub: event.authUserId,
        token_use: "revocation",
        sid: event.authSessionId,
        reason: event.reason,
        occurred_at: occurredAt,
        iat: issuedAt,
        exp: issuedAt + 60,
        jti: randomUUID(),
      });
      const baseUrl = process.env.VEY_API_INTERNAL_URL || getApiBaseUrl();
      if (!baseUrl) throw new Error("Vey API is not configured");
      const response = await fetch(
        new URL("/api/v1/auth/identity/revoke", baseUrl).toString(),
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        },
      );
      if (response.status !== 204)
        throw new Error("Revocation was not accepted");
    } catch {
      // Fail before identity mutation; callers can retry without a falsely successful logout/reset.
      throw new APIError("SERVICE_UNAVAILABLE", {
        message: "Unable to update your sessions. Please try again.",
      });
    }
  };
}

export function createRevocationHooks(revoke: Revoke) {
  return {
    session: {
      delete: {
        before: async (session, context) => {
          // Natural identity expiry does not shorten an independently valid Vey session.
          if (context?.path === "/get-session") return;
          await revoke({
            authUserId: session.userId,
            authSessionId: session.id,
            reason: "SESSION_REVOKED",
          });
        },
      },
    },
    verification: {
      delete: {
        before: async (verification, context) => {
          if (
            context?.path !== "/reset-password" ||
            !verification.identifier.startsWith("reset-password:") ||
            verification.expiresAt.getTime() <= Date.now()
          )
            return;
          // This hook runs before the one-use reset token is consumed and before password writes.
          await revoke({
            authUserId: verification.value,
            reason: "PASSWORD_RESET",
          });
        },
      },
    },
  } satisfies NonNullable<BetterAuthOptions["databaseHooks"]>;
}
