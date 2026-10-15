import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { fetchRevocation, getApiBaseUrl } = vi.hoisted(() => ({
  fetchRevocation: vi.fn(),
  getApiBaseUrl: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api/config", () => ({ getApiBaseUrl }));

import {
  createIdentityRevoker,
  createRevocationHooks,
} from "@/lib/auth/revocation";

const occurredAt = new Date("2026-10-15T12:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(occurredAt);
  vi.stubGlobal("fetch", fetchRevocation);
  vi.stubEnv("VEY_API_INTERNAL_URL", "http://backend:8081");
  getApiBaseUrl.mockReturnValue("http://localhost:8081");
  fetchRevocation.mockResolvedValue(new Response(null, { status: 204 }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("createIdentityRevoker", () => {
  it("signs a short-lived session-scoped event and sends only its bearer token", async () => {
    const sign = vi.fn().mockResolvedValue({ token: "signed-event-token" });
    const revoke = createIdentityRevoker(sign);

    await revoke({
      authUserId: "identity-user-1",
      authSessionId: "identity-session-1",
      reason: "SESSION_REVOKED",
    });

    expect(sign).toHaveBeenCalledOnce();
    const [payload] = sign.mock.calls[0];
    const issuedAt = Math.floor(occurredAt.getTime() / 1000);
    expect(payload).toMatchObject({
      sub: "identity-user-1",
      token_use: "revocation",
      sid: "identity-session-1",
      reason: "SESSION_REVOKED",
      occurred_at: occurredAt.getTime(),
      iat: issuedAt,
      exp: issuedAt + 60,
    });
    expect(payload.jti).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(fetchRevocation).toHaveBeenCalledOnce();
    const [url, options] = fetchRevocation.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("http://backend:8081/api/v1/auth/identity/revoke");
    expect(options.method).toBe("POST");
    expect(options.body).toBeUndefined();
    expect(options.cache).toBe("no-store");
    expect(options.signal).toBeDefined();
    const headers = new Headers(options.headers);
    expect(headers.get("authorization")).toBe("Bearer signed-event-token");
    expect(headers.get("cookie")).toBeNull();
    expect(options.credentials).not.toBe("include");
  });

  it("signs an identity-wide password reset without a session scope", async () => {
    const sign = vi.fn().mockResolvedValue({ token: "signed-event-token" });

    await createIdentityRevoker(sign)({
      authUserId: "identity-user-1",
      reason: "PASSWORD_RESET",
    });

    expect(sign.mock.calls[0][0]).toMatchObject({
      sub: "identity-user-1",
      reason: "PASSWORD_RESET",
    });
    expect(sign.mock.calls[0][0].sid).toBeUndefined();
  });

  it("uses the shared API URL when no internal URL is configured", async () => {
    vi.stubEnv("VEY_API_INTERNAL_URL", "");
    const sign = vi.fn().mockResolvedValue({ token: "signed-event-token" });

    await createIdentityRevoker(sign)({
      authUserId: "identity-user-1",
      reason: "PASSWORD_RESET",
    });

    expect(fetchRevocation.mock.calls[0][0]).toBe(
      "http://localhost:8081/api/v1/auth/identity/revoke",
    );
  });

  it("does not send an event when signing fails", async () => {
    const failure = new Error("Signing unavailable");
    const sign = vi.fn().mockRejectedValue(failure);

    await expect(
      createIdentityRevoker(sign)({
        authUserId: "identity-user-1",
        reason: "PASSWORD_RESET",
      }),
    ).rejects.toThrow();

    expect(fetchRevocation).not.toHaveBeenCalled();
  });

  it("propagates network failure to prevent partial revocation", async () => {
    fetchRevocation.mockRejectedValue(new Error("Spring unreachable"));
    const sign = vi.fn().mockResolvedValue({ token: "signed-event-token" });

    await expect(
      createIdentityRevoker(sign)({
        authUserId: "identity-user-1",
        reason: "PASSWORD_RESET",
      }),
    ).rejects.toThrow();
  });

  it.each([200, 401, 403, 500])(
    "rejects HTTP %s because revocation was not acknowledged with 204",
    async (status) => {
      fetchRevocation.mockResolvedValue(new Response(null, { status }));
      const sign = vi.fn().mockResolvedValue({ token: "signed-event-token" });

      await expect(
        createIdentityRevoker(sign)({
          authUserId: "identity-user-1",
          reason: "PASSWORD_RESET",
        }),
      ).rejects.toThrow();
    },
  );
});

const identitySession = {
  userId: "identity-user-1",
  id: "identity-session-1",
  createdAt: occurredAt,
  updatedAt: occurredAt,
  expiresAt: new Date(occurredAt.getTime() + 60_000),
  token: "identity-session-token",
};
const resetVerification = {
  id: "verification-1",
  createdAt: occurredAt,
  updatedAt: occurredAt,
  identifier: "reset-password:reset-token-1",
  value: "identity-user-1",
  expiresAt: new Date(occurredAt.getTime() + 60_000),
};

type HookContext = Parameters<
  ReturnType<typeof createRevocationHooks>["session"]["delete"]["before"]
>[1];

// Better Auth supplies a larger endpoint context; these hooks only inspect its path.
function hookContext(path: string): HookContext {
  return { path } as HookContext;
}

describe("createRevocationHooks", () => {
  it("waits for Vey revocation before allowing identity session deletion", async () => {
    let acknowledge!: () => void;
    const revoke = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        acknowledge = resolve;
      }),
    );
    const hooks = createRevocationHooks(revoke);
    const deletionReady = vi.fn();

    const operation = hooks.session.delete
      .before(identitySession, hookContext("/sign-out"))
      .then(deletionReady);
    await Promise.resolve();

    expect(revoke).toHaveBeenCalledWith({
      authUserId: "identity-user-1",
      authSessionId: "identity-session-1",
      reason: "SESSION_REVOKED",
    });
    expect(deletionReady).not.toHaveBeenCalled();

    acknowledge();
    await operation;

    expect(deletionReady).toHaveBeenCalledOnce();
  });

  it("blocks identity session deletion if Vey revocation fails", async () => {
    const failure = new Error("Vey revocation failed");
    const revoke = vi.fn().mockRejectedValue(failure);
    const hooks = createRevocationHooks(revoke);

    await expect(
      hooks.session.delete.before(identitySession, hookContext("/sign-out")),
    ).rejects.toThrow("Vey revocation failed");
  });

  it("does not revoke Vey during natural Better Auth expiry cleanup", async () => {
    const revoke = vi.fn().mockResolvedValue(undefined);
    const hooks = createRevocationHooks(revoke);

    await hooks.session.delete.before(
      identitySession,
      hookContext("/get-session"),
    );

    expect(revoke).not.toHaveBeenCalled();
  });

  it("waits for identity-wide revocation before allowing password reset mutation", async () => {
    let acknowledge!: () => void;
    const revoke = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        acknowledge = resolve;
      }),
    );
    const hooks = createRevocationHooks(revoke);
    const mutationReady = vi.fn();

    const operation = hooks.verification.delete
      .before(resetVerification, hookContext("/reset-password"))
      .then(mutationReady);
    await Promise.resolve();

    expect(revoke).toHaveBeenCalledWith({
      authUserId: "identity-user-1",
      reason: "PASSWORD_RESET",
    });
    expect(mutationReady).not.toHaveBeenCalled();

    acknowledge();
    await operation;

    expect(mutationReady).toHaveBeenCalledOnce();
  });

  it("blocks password reset mutation if Vey revocation fails", async () => {
    const revoke = vi
      .fn()
      .mockRejectedValue(new Error("Vey revocation failed"));
    const hooks = createRevocationHooks(revoke);

    await expect(
      hooks.verification.delete.before(
        resetVerification,
        hookContext("/reset-password"),
      ),
    ).rejects.toThrow("Vey revocation failed");
  });

  it.each([
    ["unrelated endpoint", resetVerification, "/verify-email"],
    [
      "unrelated verification",
      { ...resetVerification, identifier: "email-verification:token-1" },
      "/reset-password",
    ],
    [
      "expired reset verification",
      { ...resetVerification, expiresAt: new Date(occurredAt.getTime() - 1) },
      "/reset-password",
    ],
    [
      "reset verification expiring now",
      { ...resetVerification, expiresAt: occurredAt },
      "/reset-password",
    ],
  ])("does not revoke on %s", async (_, verification, path) => {
    const revoke = vi.fn().mockResolvedValue(undefined);
    const hooks = createRevocationHooks(revoke);

    await hooks.verification.delete.before(verification, hookContext(path));

    expect(revoke).not.toHaveBeenCalled();
  });
});
