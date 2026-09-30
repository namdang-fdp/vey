import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

const {
  requestPasswordReset,
  resetPassword,
  replace,
  refresh,
  toastError,
  toastSuccess,
} = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: { requestPasswordReset, resetPassword },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

describe("password recovery forms", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates forgot email and requests reset with generic success", async () => {
    requestPasswordReset.mockResolvedValue({ error: null });
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByText("Email address is required")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    await waitFor(() =>
      expect(requestPasswordReset).toHaveBeenCalledWith({
        email: "user@example.com",
        redirectTo: "/reset-password",
      }),
    );
    expect(
      screen.getByText(
        "If an account exists for this email, we've sent password reset instructions.",
      ),
    ).toBeVisible();
  });

  it("does not disclose whether an account exists", async () => {
    requestPasswordReset.mockResolvedValue({
      error: { status: 404, code: "USER_NOT_FOUND" },
    });
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "unknown@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(
      await screen.findByText(
        "If an account exists for this email, we've sent password reset instructions.",
      ),
    ).toBeVisible();
  });

  it("shows a generic delivery error without claiming an email was sent", async () => {
    requestPasswordReset.mockResolvedValue({
      error: { status: 500, code: "INTERNAL_SERVER_ERROR" },
    });
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Unable to send instructions right now. Please try again later.",
      ),
    );
    expect(
      screen.queryByText(
        "If an account exists for this email, we've sent password reset instructions.",
      ),
    ).not.toBeInTheDocument();
  });

  it("requires a token before showing the reset form", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText("Reset link unavailable")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Update password" }),
    ).not.toBeInTheDocument();
  });

  it("validates reset password and confirmation", async () => {
    render(<ResetPasswordForm token="test-token" />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeVisible();
    expect(screen.getByText("Passwords do not match")).toBeVisible();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("resets password and returns to login", async () => {
    resetPassword.mockResolvedValue({ error: null });
    render(<ResetPasswordForm token="test-token" />);
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newPassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({
        newPassword: "newPassword123",
        token: "test-token",
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith(
      "Password updated. You can sign in with your new password.",
    );
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it.each(["INVALID_TOKEN", "TOKEN_EXPIRED"] as const)(
    "offers a new link for %s",
    async (code) => {
      resetPassword.mockResolvedValue({ error: { code } });
      render(<ResetPasswordForm token="test-token" />);
      fireEvent.change(screen.getByLabelText("New password"), {
        target: { value: "newPassword123" },
      });
      fireEvent.change(screen.getByLabelText("Confirm new password"), {
        target: { value: "newPassword123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Update password" }));
      expect(await screen.findByText("Reset link unavailable")).toBeVisible();
      expect(
        screen.getByRole("link", { name: "Request a new link" }),
      ).toHaveAttribute("href", "/forgot-password");
    },
  );
});
