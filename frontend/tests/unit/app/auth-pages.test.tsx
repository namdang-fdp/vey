import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import AuthCompletePage from "@/app/(auth)/auth/complete/page";

const { getSession, getVeySession, doRedirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  getVeySession: vi.fn(),
  doRedirect: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({ auth: { api: { getSession } } }));
vi.mock("@/features/auth/api/session.server", () => ({ getVeySession }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    doRedirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

const veySession = {
  user: {
    id: "vey-user-1",
    email: "member@example.com",
    displayName: "Vey Member",
    avatarUrl: null,
  },
  activeWorkspace: { id: "workspace-1", name: "Personal", type: "PERSONAL" },
  membership: { role: "OWNER" },
};

const authPages = [
  {
    name: "login",
    visit: () => LoginPage({ searchParams: Promise.resolve({}) }),
  },
  { name: "register", visit: () => RegisterPage() },
];

describe("auth page session redirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getVeySession.mockResolvedValue(null);
    getSession.mockResolvedValue(null);
  });

  for (const page of authPages) {
    it(`sends a visitor with a valid Vey session from ${page.name} to meetings`, async () => {
      getVeySession.mockResolvedValue(veySession);

      await expect(page.visit()).rejects.toThrow("NEXT_REDIRECT");

      expect(doRedirect).toHaveBeenCalledWith("/meetings");
    });

    it(`restores a missing Vey session from ${page.name} when Better Auth is still valid`, async () => {
      getSession.mockResolvedValue({ user: { id: "auth-user-1" } });

      await expect(page.visit()).rejects.toThrow("NEXT_REDIRECT");

      expect(doRedirect).toHaveBeenCalledWith("/auth/complete");
    });

    it(`renders ${page.name} when both sessions are absent`, async () => {
      expect(await page.visit()).toBeTruthy();
      expect(doRedirect).not.toHaveBeenCalled();
    });
  }

  it("skips auth completion when the Vey session is already valid", async () => {
    getVeySession.mockResolvedValue(veySession);

    await expect(AuthCompletePage()).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/meetings");
  });

  it("requires a Better Auth session to exchange when Vey session is missing", async () => {
    await expect(AuthCompletePage()).rejects.toThrow("NEXT_REDIRECT");

    expect(doRedirect).toHaveBeenCalledWith("/login");
  });

  it("renders auth completion to exchange a valid Better Auth session", async () => {
    getSession.mockResolvedValue({ user: { id: "auth-user-1" } });

    expect(await AuthCompletePage()).toBeTruthy();
    expect(doRedirect).not.toHaveBeenCalled();
  });
});
