import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompleteSignIn } from "@/features/auth/components/complete-sign-in";
const { token, post, get, replace, refresh } = vi.hoisted(() => ({
  token: vi.fn(),
  post: vi.fn(),
  get: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/lib/notifications", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));
vi.mock("@/lib/auth/client", () => ({ authClient: { token } }));
vi.mock("@/lib/api/client", () => ({ apiClient: { post, get } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("@/features/auth/components/sign-out-control", () => ({
  SignOutControl: () => <button>Sign out</button>,
}));
describe("CompleteSignIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    token.mockResolvedValue({ data: { token: "transient-passport" } });
    post.mockResolvedValue({});
    get.mockResolvedValue({});
  });
  it("exchanges the passport once and verifies the application cookie before redirecting", async () => {
    render(<CompleteSignIn />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/meetings"));
    expect(token).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/api/v1/auth/session", undefined, {
      headers: { Authorization: "Bearer transient-passport" },
      timeout: 10000,
    });
    expect(get).toHaveBeenCalledWith("/api/v1/auth/me", { timeout: 10000 });
    expect(refresh).toHaveBeenCalled();
  });
  it("keeps the user on the error screen and requests a fresh passport on retry", async () => {
    post.mockRejectedValueOnce(new Error("unavailable"));
    render(<CompleteSignIn />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn't open your workspace",
    );
    expect(replace).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/meetings"));
    expect(token).toHaveBeenCalledTimes(2);
  });
  it("does not exchange when the identity session cannot issue a token", async () => {
    token.mockResolvedValue({ error: { code: "UNAUTHORIZED" } });
    render(<CompleteSignIn />);
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(post).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
