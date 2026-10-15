import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ApplicationLayout from "@/app/(application)/layout";

const { getSession, getVeySession, doRedirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  getVeySession: vi.fn(),
  doRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ auth: { api: { getSession } } }));
vi.mock("@/lib/auth/vey-session", () => ({ getVeySession }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/components/shell/application-navigation", () => ({
  ApplicationNavigation: () => null,
}));
vi.mock("@/features/auth/components/sign-out-control", () => ({
  SignOutControl: () => null,
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    doRedirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

const veySession = {
  user: {
    id: "vey-user-1",
    displayName: "Vey Member",
    email: "member@example.com",
    avatarUrl: null,
  },
  activeWorkspace: { id: "workspace-1", name: "Personal", type: "PERSONAL" },
  membership: { role: "OWNER" },
};

describe("ApplicationLayout session protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getVeySession.mockResolvedValue(null);
    getSession.mockResolvedValue(null);
  });

  it("redirects to login when both sessions are absent", async () => {
    await expect(
      ApplicationLayout({ children: createElement("p", null, "Private") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/login");
  });

  it("renders Vey identity when the Better Auth session has expired", async () => {
    getVeySession.mockResolvedValue(veySession);

    render(
      await ApplicationLayout({
        children: createElement("p", null, "Private"),
      }),
    );

    expect(screen.getByText("Private")).toBeInTheDocument();
    expect(screen.getByText("Vey Member")).toBeInTheDocument();
    expect(screen.getByText("member@example.com")).toBeInTheDocument();
    expect(doRedirect).not.toHaveBeenCalled();
  });

  it("restores a missing Vey session before exposing the application shell", async () => {
    getSession.mockResolvedValue({ user: { id: "auth-user-1" } });

    await expect(
      ApplicationLayout({ children: createElement("p", null, "Private") }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/auth/complete");
  });

  it("does not treat an unavailable Vey backend as an expired session", async () => {
    getVeySession.mockRejectedValue(new Error("Vey API unavailable"));
    getSession.mockResolvedValue({ user: { id: "auth-user-1" } });

    await expect(
      ApplicationLayout({ children: createElement("p", null, "Private") }),
    ).rejects.toThrow("Vey API unavailable");

    expect(doRedirect).not.toHaveBeenCalled();
  });
});
