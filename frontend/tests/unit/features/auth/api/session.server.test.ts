import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { requestHeaders, fetchSession, getApiBaseUrl } = vi.hoisted(() => ({
  requestHeaders: vi.fn(),
  fetchSession: vi.fn(),
  getApiBaseUrl: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: requestHeaders }));
vi.mock("@/lib/api/config", () => ({ getApiBaseUrl }));

import {
  getVeySession,
  WorkspaceAccessError,
} from "@/features/auth/api/session.server";

const context = {
  user: {
    id: "c5e33b4d-e42b-4a95-85bb-d9f93e9db5d2",
    email: "member@example.com",
    displayName: "Vey Member",
    avatarUrl: null,
  },
  activeWorkspace: {
    id: "a5ec5f6d-8dd9-47ee-ac09-1fd2612d67cb",
    name: "Personal",
    type: "PERSONAL",
  },
  membership: { role: "OWNER" },
};

function successfulResponse(result: unknown = context, code = 1000) {
  return new Response(JSON.stringify({ code, result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("getVeySession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchSession);
    vi.stubEnv("VEY_API_INTERNAL_URL", "http://backend:8081");
    getApiBaseUrl.mockReturnValue("http://localhost:8081");
    requestHeaders.mockResolvedValue(
      new Headers({ cookie: "vey_session=opaque-session-token" }),
    );
    fetchSession.mockResolvedValue(successfulResponse());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null without contacting Spring when Vey cookie is absent", async () => {
    requestHeaders.mockResolvedValue(
      new Headers({ cookie: "better-auth.session_token=identity-session" }),
    );

    await expect(getVeySession()).resolves.toBeNull();

    expect(fetchSession).not.toHaveBeenCalled();
  });

  it("forwards only the Vey cookie and returns the validated context", async () => {
    requestHeaders.mockResolvedValue(
      new Headers({
        cookie:
          "better-auth.session_token=identity-secret; vey_session=opaque-session-token; analytics=tracking",
        authorization: "Bearer unrelated-secret",
      }),
    );

    await expect(getVeySession()).resolves.toEqual(context);

    expect(fetchSession).toHaveBeenCalledOnce();
    const [url, options] = fetchSession.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://backend:8081/api/v1/auth/me");
    expect(options.method ?? "GET").toBe("GET");
    expect(options.cache).toBe("no-store");
    expect(options.signal).toBeDefined();
    const forwardedHeaders = new Headers(options.headers);
    expect(forwardedHeaders.get("cookie")).toBe(
      "vey_session=opaque-session-token",
    );
    expect(forwardedHeaders.get("authorization")).toBeNull();
    expect(options.credentials).not.toBe("include");
  });

  it("uses the shared API URL when no internal URL is configured", async () => {
    vi.stubEnv("VEY_API_INTERNAL_URL", "");

    await expect(getVeySession()).resolves.toEqual(context);

    expect(fetchSession.mock.calls[0][0]).toBe(
      "http://localhost:8081/api/v1/auth/me",
    );
  });

  it("returns null for an expired or revoked Vey session", async () => {
    fetchSession.mockResolvedValue(new Response(null, { status: 401 }));

    await expect(getVeySession()).resolves.toBeNull();
  });

  it("distinguishes denied workspace access from an expired session", async () => {
    fetchSession.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(getVeySession()).rejects.toBeInstanceOf(WorkspaceAccessError);
  });

  it("throws when Spring is unavailable instead of reporting an expired session", async () => {
    fetchSession.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(getVeySession()).rejects.toThrow();
  });

  it("throws when the backend request fails", async () => {
    fetchSession.mockRejectedValue(new Error("connection refused"));

    await expect(getVeySession()).rejects.toThrow();
  });

  it("accepts a team workspace and nullable profile fields", async () => {
    const teamContext = {
      ...context,
      user: { ...context.user, displayName: null },
      activeWorkspace: { ...context.activeWorkspace, type: "TEAM" },
      membership: { role: "GUEST" },
    };
    fetchSession.mockResolvedValue(successfulResponse(teamContext));

    await expect(getVeySession()).resolves.toEqual(teamContext);
  });

  it.each([
    [
      "invalid user ID",
      { ...context, user: { ...context.user, id: "user-1" } },
    ],
    [
      "invalid user email",
      { ...context, user: { ...context.user, email: "invalid" } },
    ],
    [
      "invalid workspace ID",
      {
        ...context,
        activeWorkspace: { ...context.activeWorkspace, id: "workspace-1" },
      },
    ],
    [
      "unknown workspace type",
      {
        ...context,
        activeWorkspace: { ...context.activeWorkspace, type: "UNKNOWN" },
      },
    ],
    [
      "unknown membership role",
      { ...context, membership: { role: "UNKNOWN" } },
    ],
    ["missing context", null],
  ])("throws for a malformed success response with %s", async (_, result) => {
    fetchSession.mockResolvedValue(successfulResponse(result));

    await expect(getVeySession()).rejects.toThrow();
  });

  it("rejects an application error even when the HTTP status is successful", async () => {
    fetchSession.mockResolvedValue(successfulResponse(context, 1001));

    await expect(getVeySession()).rejects.toThrow();
  });

  it("throws for an invalid JSON response", async () => {
    fetchSession.mockResolvedValue(new Response("not-json", { status: 200 }));

    await expect(getVeySession()).rejects.toThrow();
  });
});
