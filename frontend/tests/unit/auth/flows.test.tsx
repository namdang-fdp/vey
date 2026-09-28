import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signUp, router } = vi.hoisted(() => ({
  signIn: {
    status: "needs_first_factor",
    supportedSecondFactors: [{ strategy: "email_code" }],
    password: vi.fn(),
    sso: vi.fn(),
    finalize: vi.fn(),
    mfa: { sendEmailCode: vi.fn(), verifyEmailCode: vi.fn() },
    create: vi.fn(),
    resetPasswordEmailCode: {
      sendCode: vi.fn(),
      verifyCode: vi.fn(),
      submitPassword: vi.fn(),
    },
  },
  signUp: {
    status: "missing_requirements",
    missingFields: [] as string[],
    unverifiedFields: [] as string[],
    password: vi.fn(),
    sso: vi.fn(),
    finalize: vi.fn(),
    verifications: { sendEmailCode: vi.fn(), verifyEmailCode: vi.fn() },
  },
  router: { replace: vi.fn() },
}));

vi.mock("@clerk/nextjs", () => ({
  useSignIn: () => ({ signIn, fetchStatus: "idle" }),
  useSignUp: () => ({ signUp, fetchStatus: "idle" }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { authError } from "@/features/auth/auth-error";
import { useLoginFlow } from "@/features/auth/hooks/use-login-flow";
import { useRegisterFlow } from "@/features/auth/hooks/use-register-flow";
import { usePasswordRecoveryFlow } from "@/features/auth/hooks/use-password-recovery-flow";

const ok = { error: null };

describe("headless Clerk flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signIn.status = "needs_first_factor";
    signUp.status = "missing_requirements";
    signUp.missingFields = [];
    signUp.unverifiedFields = [];
    signIn.password.mockImplementation(async () => {
      signIn.status = "complete";
      return ok;
    });
    signIn.sso.mockResolvedValue(ok);
    signIn.finalize.mockImplementation(async ({ navigate }) => {
      navigate({ session: {}, decorateUrl: (url: string) => url });
      return ok;
    });
    signIn.mfa.sendEmailCode.mockResolvedValue(ok);
    signIn.mfa.verifyEmailCode.mockImplementation(async () => {
      signIn.status = "complete";
      return ok;
    });
    signUp.password.mockImplementation(async () => {
      signUp.unverifiedFields = ["email_address"];
      return ok;
    });
    signUp.sso.mockResolvedValue(ok);
    signUp.verifications.sendEmailCode.mockResolvedValue(ok);
    signUp.verifications.verifyEmailCode.mockImplementation(async () => {
      signUp.status = "complete";
      return ok;
    });
    signUp.finalize.mockImplementation(async ({ navigate }) => {
      navigate({ session: {}, decorateUrl: (url: string) => url });
      return ok;
    });
    signIn.create.mockResolvedValue(ok);
    signIn.resetPasswordEmailCode.sendCode.mockResolvedValue(ok);
    signIn.resetPasswordEmailCode.verifyCode.mockImplementation(async () => {
      signIn.status = "needs_new_password";
      return ok;
    });
    signIn.resetPasswordEmailCode.submitPassword.mockImplementation(
      async () => {
        signIn.status = "complete";
        return ok;
      },
    );
  });

  it("delegates password login and navigates to a safe internal destination", async () => {
    const { result } = renderHook(() => useLoginFlow("/settings?tab=profile"));
    await act(async () =>
      result.current.submitPassword("a@example.com", "secret"),
    );
    expect(signIn.password).toHaveBeenCalledWith({
      identifier: "a@example.com",
      password: "secret",
    });
    expect(signIn.finalize).toHaveBeenCalledOnce();
    expect(router.replace).toHaveBeenCalledWith("/settings?tab=profile");
    expect(result.current.step).toBe("complete");
  });

  it("handles a required email second factor before finalizing login", async () => {
    signIn.password.mockImplementation(async () => {
      signIn.status = "needs_client_trust";
      return ok;
    });
    const { result } = renderHook(() => useLoginFlow());
    await act(async () =>
      result.current.submitPassword("a@example.com", "secret"),
    );
    expect(result.current.step).toBe("email-code");
    expect(signIn.mfa.sendEmailCode).toHaveBeenCalledOnce();
    expect(signIn.finalize).not.toHaveBeenCalled();
    await act(async () => result.current.verifyEmailCode("123456"));
    expect(signIn.mfa.verifyEmailCode).toHaveBeenCalledWith({ code: "123456" });
    expect(signIn.finalize).toHaveBeenCalledOnce();
  });

  it("requires signup verification before activating a session", async () => {
    const { result } = renderHook(() => useRegisterFlow());
    await act(async () =>
      result.current.submitPassword("a@example.com", "secret"),
    );
    expect(signUp.password).toHaveBeenCalledWith({
      emailAddress: "a@example.com",
      password: "secret",
    });
    expect(signUp.verifications.sendEmailCode).toHaveBeenCalledOnce();
    expect(result.current.step).toBe("verification-required");
    expect(signUp.finalize).not.toHaveBeenCalled();
    await act(async () => result.current.verifyEmailCode("123456"));
    expect(signUp.verifications.verifyEmailCode).toHaveBeenCalledWith({
      code: "123456",
    });
    expect(signUp.finalize).toHaveBeenCalledOnce();
    expect(router.replace).toHaveBeenCalledWith("/meetings");
  });

  it.each([
    ["google", "oauth_google"],
    ["github", "oauth_github"],
    ["facebook", "oauth_facebook"],
  ] as const)(
    "maps %s to Clerk %s for both flows",
    async (provider, strategy) => {
      const login = renderHook(() => useLoginFlow());
      const register = renderHook(() => useRegisterFlow());
      await act(async () => login.result.current.startSocial(provider));
      await act(async () => register.result.current.startSocial(provider));
      expect(login.result.current.activeProvider).toBe(provider);
      expect(register.result.current.activeProvider).toBe(provider);
      expect(signIn.sso).toHaveBeenCalledWith(
        expect.objectContaining({ strategy, redirectUrl: "/meetings" }),
      );
      expect(signUp.sso).toHaveBeenCalledWith(
        expect.objectContaining({ strategy, redirectUrl: "/meetings" }),
      );
    },
  );

  it("offers the complete email reset sequence", async () => {
    const { result } = renderHook(() => usePasswordRecoveryFlow());
    await act(async () => result.current.sendCode("a@example.com"));
    expect(signIn.create).toHaveBeenCalledWith({ identifier: "a@example.com" });
    expect(result.current.step).toBe("code");
    await act(async () => result.current.verifyCode("123456"));
    expect(result.current.step).toBe("new-password");
    await act(async () => result.current.submitNewPassword("new-secret"));
    expect(signIn.resetPasswordEmailCode.submitPassword).toHaveBeenCalledWith({
      password: "new-secret",
    });
    expect(signIn.finalize).toHaveBeenCalledOnce();
  });

  it("normalizes Clerk errors without exposing the object", async () => {
    const clerkError = {
      code: "form_password_incorrect",
      message: "Password is incorrect",
      internal: "secret",
    };
    signIn.password.mockResolvedValue({ error: clerkError });
    const { result } = renderHook(() => useLoginFlow());
    await act(async () =>
      result.current.submitPassword("a@example.com", "bad"),
    );
    expect(result.current.error).toEqual({ message: "Password is incorrect" });
    expect(authError({ code: "unknown" })).toEqual({
      message: "Authentication could not be completed. Please try again.",
    });
    expect(
      authError({
        errors: [
          {
            code: "password_too_short",
            longMessage: "Password must be at least 8 characters.",
          },
        ],
      }),
    ).toEqual({
      message: "Password must be at least 8 characters.",
    });
  });
});
