import { beforeEach, describe, expect, it, vi } from "vitest";

const { getHandler, postHandler, getSession, resetPasswordTransaction } =
  vi.hoisted(() => ({
    getHandler: vi.fn(),
    postHandler: vi.fn(),
    getSession: vi.fn(),
    resetPasswordTransaction: vi.fn(),
  }));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: () => ({ GET: getHandler, POST: postHandler }),
}));
vi.mock("@/lib/auth/server", () => ({ auth: { api: { getSession } } }));

vi.mock("@/lib/auth/password-reset", () => ({ resetPasswordTransaction }));

import { GET, POST } from "@/app/api/auth/[...all]/route";

function signOutRequest() {
  return new Request("http://localhost:3000/api/auth/sign-out", {
    method: "POST",
    headers: { cookie: "better-auth.session_token=identity-session-token" },
  });
}

function signOutResponse() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": "better-auth.session_token=; Max-Age=0; Path=/; HttpOnly",
    },
  });
}

describe("Better Auth route logout verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postHandler.mockResolvedValue(signOutResponse());
    getSession.mockResolvedValue(null);
  });

  it("routes password reset through the transaction wrapper with the original request", async () => {
    const request = new Request(
      "http://localhost:3000/api/auth/reset-password",
      {
        method: "POST",
      },
    );
    const wrappedResponse = new Response("transactional reset", {
      status: 200,
    });
    resetPasswordTransaction.mockResolvedValue(wrappedResponse);

    expect(await POST(request)).toBe(wrappedResponse);
    expect(resetPasswordTransaction).toHaveBeenCalledWith(request);
    expect(postHandler).not.toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("exports the official GET handler unchanged", () => {
    expect(GET).toBe(getHandler);
  });

  it("preserves the retry cookie when Better Auth reports success but identity still exists", async () => {
    getSession.mockResolvedValue({ user: { id: "identity-user-1" } });

    const response = await POST(signOutRequest());

    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toBeTypeOf("object");
  });

  it("preserves the retry cookie and hides details when logout verification fails", async () => {
    getSession.mockRejectedValue(new Error("secret database failure"));

    const response = await POST(signOutRequest());

    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.text()).not.toContain("secret database failure");
  });

  it("verifies the original identity without cookie cache before forwarding successful logout", async () => {
    const request = signOutRequest();
    const officialResponse = signOutResponse();
    postHandler.mockResolvedValue(officialResponse);

    const response = await POST(request);

    expect(postHandler).toHaveBeenCalledWith(request);
    expect(getSession).toHaveBeenCalledWith({
      headers: request.headers,
      query: { disableCookieCache: true },
    });
    expect(response).toBe(officialResponse);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("forwards non-logout POST responses without reading identity", async () => {
    const request = new Request(
      "http://localhost:3000/api/auth/sign-in/email",
      { method: "POST" },
    );
    const officialResponse = new Response("identity response", { status: 200 });
    postHandler.mockResolvedValue(officialResponse);

    expect(await POST(request)).toBe(officialResponse);
    expect(getSession).not.toHaveBeenCalled();
  });

  it("forwards Better Auth logout failures without post-checking identity", async () => {
    const officialResponse = new Response("logout rejected", { status: 400 });
    postHandler.mockResolvedValue(officialResponse);

    expect(await POST(signOutRequest())).toBe(officialResponse);
    expect(getSession).not.toHaveBeenCalled();
  });
});
