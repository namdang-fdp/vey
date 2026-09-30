import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";

const { replace, refresh, signInEmail, signInSocial, toastError } = vi.hoisted(
  () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
    signInEmail: vi.fn(),
    signInSocial: vi.fn(),
    toastError: vi.fn(),
  }),
);

vi.mock("@/lib/auth/client", () => ({
  authClient: { signIn: { email: signInEmail, social: signInSocial } },
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
        callbackURL: "/meetings",
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

  it.each(["google", "github", "facebook"] as const)(
    "starts %s OAuth with the right callback",
    async (provider) => {
      signInSocial.mockResolvedValue({ error: null });
      render(<LoginForm />);
      const label =
        provider === "github"
          ? "GitHub"
          : provider[0].toUpperCase() + provider.slice(1);
      fireEvent.click(
        screen.getByRole("button", { name: `Continue with ${label}` }),
      );
      await waitFor(() =>
        expect(signInSocial).toHaveBeenCalledWith({
          provider,
          callbackURL: "/meetings",
          errorCallbackURL: "/login?oauth=failed",
        }),
      );
    },
  );

  it("locks credential and social controls while OAuth is pending", async () => {
    signInSocial.mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Email address")).toBeDisabled(),
    );
    expect(
      screen.getByRole("button", { name: "Continue with GitHub" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();
  });

  it("shows a friendly error when OAuth cannot start", async () => {
    signInSocial.mockResolvedValue({
      error: { code: "PROVIDER_NOT_CONFIGURED" },
    });
    render(<LoginForm />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Unable to continue with Google. Please try again.",
      ),
    );
  });

  it("explains unverified email sign in", async () => {
    signInEmail.mockResolvedValue({ error: { code: "EMAIL_NOT_VERIFIED" } });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Please verify your email before signing in. Check your inbox for a verification link.",
      ),
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
