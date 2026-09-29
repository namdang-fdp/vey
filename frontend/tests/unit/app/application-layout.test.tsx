import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ApplicationLayout from "@/app/(application)/layout";

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

describe("ApplicationLayout session protection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects before rendering the application shell without a session", async () => {
    getSession.mockResolvedValue(null);

    await expect(
      ApplicationLayout({ children: createElement("p", null, "Private") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/login");
  });

  it("renders the application shell for a valid session", async () => {
    getSession.mockResolvedValue({
      user: { id: "user-1" },
      session: { id: "session-1" },
    });

    const shell = await ApplicationLayout({
      children: createElement("p", null, "Private"),
    });

    expect(shell.type).toBe("div");
    expect(doRedirect).not.toHaveBeenCalled();
  });
});
