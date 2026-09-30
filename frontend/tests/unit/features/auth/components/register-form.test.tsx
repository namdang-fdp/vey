import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/features/auth/components/register-form";

const { signUpEmail, sendVerificationEmail, toastError, toastSuccess } =
  vi.hoisted(() => ({
    signUpEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
  }));

vi.mock("@/lib/auth/client", () => ({
  authClient: { signUp: { email: signUpEmail }, sendVerificationEmail },
}));
vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

function fillRegistration(
  options: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {},
) {
  const name = options.name ?? "Vey User";
  const email = options.email ?? "user@example.com";
  const password = options.password ?? "password123";
  const confirmPassword = options.confirmPassword ?? password;
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirm password"), {
    target: { value: confirmPassword },
  });
}

describe("RegisterForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates required fields, email and Better Auth's 8 character minimum", async () => {
    render(<RegisterForm />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Name is required")).toBeVisible();
    expect(screen.getByText("Email address is required")).toBeVisible();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    expect(screen.getByText("Please confirm your password")).toBeVisible();

    fillRegistration({ email: "invalid-email", password: "short" });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeVisible();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("rejects a password confirmation mismatch", async () => {
    render(<RegisterForm />);
    fillRegistration({ confirmPassword: "different123" });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match")).toBeVisible();
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("creates the account and shows check-email without redirect", async () => {
    signUpEmail.mockResolvedValue({ data: { token: null }, error: null });
    render(<RegisterForm />);
    fillRegistration({ name: "  Vey User  " });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(signUpEmail).toHaveBeenCalledWith({
        name: "Vey User",
        email: "user@example.com",
        password: "password123",
        callbackURL: "/meetings",
      }),
    );
    expect(screen.getByText("Check your email")).toBeVisible();
    expect(screen.getByText("user@example.com")).toBeVisible();
    sendVerificationEmail.mockResolvedValue({ error: null });
    fireEvent.click(
      screen.getByRole("button", { name: "Resend verification email" }),
    );
    await waitFor(() =>
      expect(sendVerificationEmail).toHaveBeenCalledWith({
        email: "user@example.com",
        callbackURL: "/meetings",
      }),
    );
    expect(toastSuccess).toHaveBeenCalled();
  });

  it("maps duplicate email errors to friendly copy", async () => {
    signUpEmail.mockResolvedValue({
      data: null,
      error: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
    });
    render(<RegisterForm />);
    fillRegistration();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "An account with this email already exists. Try signing in.",
      ),
    );
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
  });

  it("shows a generic error when verification resend fails", async () => {
    signUpEmail.mockResolvedValue({ data: { token: null }, error: null });
    sendVerificationEmail.mockResolvedValue({ error: { status: 429 } });
    render(<RegisterForm />);
    fillRegistration();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Resend verification email" }),
    );
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "Unable to resend the verification email right now. Please try again later.",
      ),
    );
  });
});
