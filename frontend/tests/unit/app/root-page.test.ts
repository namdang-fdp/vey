import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import HomePage from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirects a signed-out visitor to login", async () => {
    authMock.mockResolvedValue({ isAuthenticated: false });

    await HomePage();

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("redirects a signed-in visitor to meetings", async () => {
    authMock.mockResolvedValue({ isAuthenticated: true });

    await HomePage();

    expect(redirectMock).toHaveBeenCalledWith("/meetings");
  });
});
