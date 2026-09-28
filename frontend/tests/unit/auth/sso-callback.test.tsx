import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { clerk, signIn, signUp, router } = vi.hoisted(() => ({
  clerk: { loaded: true, setActive: vi.fn() },
  signIn: {
    status: "complete",
    isTransferable: false,
    existingSession: null,
    finalize: vi.fn(),
    create: vi.fn(),
  },
  signUp: {
    status: "missing_requirements",
    isTransferable: false,
    existingSession: null,
    missingFields: [] as string[],
    unverifiedFields: [] as string[],
    finalize: vi.fn(),
    create: vi.fn(),
    verifications: { sendEmailCode: vi.fn() },
  },
  router: { replace: vi.fn() },
}));

vi.mock("@clerk/nextjs", () => ({
  useClerk: () => clerk,
  useSignIn: () => ({ signIn }),
  useSignUp: () => ({ signUp }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { SsoCallback } from "@/features/auth/sso-callback";

describe("SSO callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signIn.status = "complete";
    signIn.isTransferable = false;
    signUp.status = "missing_requirements";
    signUp.isTransferable = false;
    signUp.unverifiedFields = [];
    signIn.finalize.mockImplementation(async ({ navigate }) => {
      navigate({ session: {}, decorateUrl: (url: string) => url });
      return { error: null };
    });
    signUp.finalize.mockImplementation(async ({ navigate }) => {
      navigate({ session: {}, decorateUrl: (url: string) => url });
      return { error: null };
    });
    signUp.verifications.sendEmailCode.mockResolvedValue({ error: null });
  });

  it("finalizes a completed social login with a safe destination", async () => {
    render(<SsoCallback returnTo="//evil.example" />);
    await waitFor(() => expect(signIn.finalize).toHaveBeenCalledOnce());
    expect(router.replace).toHaveBeenCalledWith("/meetings");
  });

  it("transfers a new social identity into signup before finalizing", async () => {
    signIn.status = "needs_first_factor";
    signIn.isTransferable = true;
    signUp.create.mockImplementation(async () => {
      signUp.status = "complete";
      return { error: null };
    });
    render(<SsoCallback returnTo="/settings" />);
    await waitFor(() => expect(signUp.finalize).toHaveBeenCalledOnce());
    expect(signUp.create).toHaveBeenCalledWith({ transfer: true });
    expect(router.replace).toHaveBeenCalledWith("/settings");
  });

  it("preserves required email verification after social signup", async () => {
    signIn.status = "needs_first_factor";
    signUp.unverifiedFields = ["email_address"];
    render(<SsoCallback />);
    await waitFor(() =>
      expect(signUp.verifications.sendEmailCode).toHaveBeenCalledOnce(),
    );
    expect(signUp.finalize).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith(
      "/register?returnTo=%2Fmeetings",
    );
  });
});
