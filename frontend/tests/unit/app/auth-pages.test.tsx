import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/(fullscreen)/login/page";
import RegisterPage from "@/app/(auth)/(fullscreen)/register/page";

const { getSession, doRedirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  doRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    doRedirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

describe("implemented auth page redirects", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends an authenticated visitor from login to meetings", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } });

    await expect(LoginPage()).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/meetings");
  });

  it("sends an authenticated visitor from register to meetings", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } });

    await expect(RegisterPage()).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/meetings");
  });
});
