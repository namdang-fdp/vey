import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignOutControl } from "@/features/auth/components/sign-out-control";

const { replace, refresh, signOut, toastError, post } = vi.hoisted(() => ({
  post: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({ apiClient: { post } }));
vi.mock("@/lib/auth/client", () => ({ authClient: { signOut } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("@/lib/notifications", () => ({
  toast: { error: toastError, info: vi.fn(), success: vi.fn() },
}));

describe("SignOutControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockResolvedValue({});
    signOut.mockResolvedValue({ data: { success: true }, error: null });
  });

  it("waits for Vey session revocation before signing out identity and navigating", async () => {
    let finishVeyLogout!: () => void;
    post.mockReturnValue(
      new Promise<void>((resolve) => {
        finishVeyLogout = resolve;
      }),
    );
    render(<SignOutControl />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(post).toHaveBeenCalledWith(
      "/api/v1/auth/session/logout",
      undefined,
      { timeout: 5000 },
    );
    expect(signOut).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Signing out..." }),
    ).toBeDisabled();

    await act(async () => finishVeyLogout());

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(signOut).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("keeps identity signed in and allows retry if Vey session revocation fails", async () => {
    post.mockRejectedValueOnce(new Error("offline"));
    render(<SignOutControl />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledOnce());
    expect(signOut).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(post).toHaveBeenCalledTimes(2);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("allows retry after Vey logout succeeds but Better Auth rejects logout", async () => {
    signOut.mockResolvedValueOnce({
      data: null,
      error: { code: "INTERNAL_ERROR" },
    });
    render(<SignOutControl />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Unable to sign out. Please try again.",
      ),
    );
    expect(post).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(post).toHaveBeenCalledTimes(2);
    expect(signOut).toHaveBeenCalledTimes(2);
  });
});
