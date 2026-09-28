import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import LoginPage from "@/app/(public-auth)/login/page";
import RegisterPage from "@/app/(public-auth)/register/page";
import ForgotPasswordPage from "@/app/(public-auth)/forgot-password/page";

describe("public authentication routes", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockReset();
  });

  it.each([
    ["login", LoginPage],
    ["register", RegisterPage],
    ["recovery", ForgotPasswordPage],
  ])("allows signed-out visitors to reach %s", async (_, page) => {
    authMock.mockResolvedValue({ isAuthenticated: false });
    const result = await page({ searchParams: Promise.resolve({}) });
    expect(result).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it.each([
    ["login", LoginPage],
    ["register", RegisterPage],
  ])("redirects signed-in visitors away from %s", async (_, page) => {
    authMock.mockResolvedValue({ isAuthenticated: true });
    await page({
      searchParams: Promise.resolve({ returnTo: "/settings?tab=profile" }),
    });
    expect(redirectMock).toHaveBeenCalledWith("/settings?tab=profile");
  });

  it("rejects an external return URL", async () => {
    authMock.mockResolvedValue({ isAuthenticated: true });
    await LoginPage({
      searchParams: Promise.resolve({ returnTo: "//evil.example" }),
    });
    expect(redirectMock).toHaveBeenCalledWith("/meetings");
  });
});
