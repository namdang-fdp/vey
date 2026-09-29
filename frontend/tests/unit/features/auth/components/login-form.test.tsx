import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";

const { replace, refresh, signInEmail, toastError } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signInEmail: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: { signIn: { email: signInEmail } },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("signs in with Better Auth and redirects after success", async () => {
    signInEmail.mockResolvedValue({ data: { token: "opaque" }, error: null });
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "  Candidate@Example.com " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "passphrase" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(signInEmail).toHaveBeenCalledWith({
        email: "Candidate@Example.com",
        password: "passphrase",
      }),
    );
    expect(replace).toHaveBeenCalledWith("/meetings");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows a friendly Better Auth error without redirecting", async () => {
    signInEmail.mockResolvedValue({
      data: null,
      error: { code: "INVALID_EMAIL_OR_PASSWORD" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "candidate@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Email or password is incorrect.",
      ),
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("keeps email and password validation on the form", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeVisible();
    expect(await screen.findByText("Password is required")).toBeVisible();
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("keeps provider choices on their preview routes", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("link", { name: "Continue with Google" }),
    ).toHaveAttribute("href", "/login/oauth/google");
    expect(
      screen.getByRole("link", { name: "Continue with GitHub" }),
    ).toHaveAttribute("href", "/login/oauth/github");
    expect(
      screen.getByRole("link", { name: "Continue with Facebook" }),
    ).toHaveAttribute("href", "/login/oauth/facebook");
  });
});
