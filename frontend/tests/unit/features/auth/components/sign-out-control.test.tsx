import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignOutControl } from "@/features/auth/components/sign-out-control";

const { replace, refresh, signOut, toastError } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({ authClient: { signOut } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

describe("SignOutControl", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invalidates the Better Auth session and returns to login", async () => {
    signOut.mockResolvedValue({ data: { success: true }, error: null });
    render(<SignOutControl />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
  });

  it("does not redirect when Better Auth reports sign-out failure", async () => {
    signOut.mockResolvedValue({
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
    expect(replace).not.toHaveBeenCalled();
  });
});
