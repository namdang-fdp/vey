import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((url: URL) => url),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware:
    (handler: (auth: typeof authMock, request: unknown) => Promise<unknown>) =>
    (request: unknown) =>
      handler(authMock, request),
}));
vi.mock("next/server", () => ({ NextResponse: { redirect: redirectMock } }));

import proxy from "@/proxy";

describe("Clerk identity gate", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockClear();
  });

  it.each(["/login", "/register", "/forgot-password", "/auth/sso-callback"])(
    "keeps %s public",
    async (path) => {
      const url = new URL(path, "http://localhost:3000");
      await proxy({ url: url.href, nextUrl: url } as never, {} as never);
      expect(authMock).not.toHaveBeenCalled();
    },
  );

  it.each(["/meetings", "/settings"])(
    "redirects signed-out %s with return intent",
    async (path) => {
      authMock.mockResolvedValue({ isAuthenticated: false });
      const url = new URL(`${path}?view=all`, "http://localhost:3000");
      await proxy({ url: url.href, nextUrl: url } as never, {} as never);
      expect(redirectMock).toHaveBeenCalledOnce();
      const target = redirectMock.mock.calls[0][0];
      expect(target.pathname).toBe("/login");
      expect(target.searchParams.get("returnTo")).toBe(`${path}?view=all`);
    },
  );

  it("allows a signed-in protected request", async () => {
    authMock.mockResolvedValue({ isAuthenticated: true });
    const url = new URL("/meetings", "http://localhost:3000");
    await proxy({ url: url.href, nextUrl: url } as never, {} as never);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
