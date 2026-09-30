import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import {
  assertAuthEmailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email/server";

describe("Resend auth templates", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({ data: { id: "message-id" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "Vey <no-reply@auth.dorriss.com>");
    vi.stubEnv("RESEND_VERIFY_EMAIL_TEMPLATE_ID", "verify-template");
    vi.stubEnv("RESEND_RESET_PASSWORD_TEMPLATE_ID", "reset-template");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("sends verification with the published template variables", async () => {
    await sendVerificationEmail(
      { email: "user@example.com", name: "Vey User" },
      "https://vey.test/verify",
    );
    expect(send).toHaveBeenCalledWith({
      from: "Vey <no-reply@auth.dorriss.com>",
      to: "user@example.com",
      template: {
        id: "verify-template",
        variables: {
          USER_NAME: "Vey User",
          VERIFICATION_URL: "https://vey.test/verify",
        },
      },
    });
  });

  it("uses a friendly fallback for a blank name", async () => {
    await sendVerificationEmail(
      { email: "user@example.com", name: "  " },
      "https://vey.test/verify",
    );
    expect(send.mock.calls[0][0].template.variables.USER_NAME).toBe("there");
  });

  it("sends reset with its separate published template", async () => {
    await sendPasswordResetEmail(
      { email: "user@example.com", name: "Vey User" },
      "https://vey.test/reset",
    );
    expect(send).toHaveBeenCalledWith({
      from: "Vey <no-reply@auth.dorriss.com>",
      to: "user@example.com",
      template: {
        id: "reset-template",
        variables: {
          USER_NAME: "Vey User",
          RESET_URL: "https://vey.test/reset",
        },
      },
    });
  });

  it("fails on missing runtime configuration and hides provider details", async () => {
    vi.stubEnv("RESEND_VERIFY_EMAIL_TEMPLATE_ID", "");
    expect(() => assertAuthEmailConfigured("verification")).toThrow(
      "configuration is incomplete",
    );
    vi.stubEnv("RESEND_VERIFY_EMAIL_TEMPLATE_ID", "verify-template");
    send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "private details" },
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      sendVerificationEmail(
        { email: "user@example.com", name: "User" },
        "https://vey.test/secret-token",
      ),
    ).rejects.toThrow("Unable to send verification email");
    expect(log).toHaveBeenCalledWith("Auth email delivery failed", {
      kind: "verification",
      errorName: "validation_error",
      statusCode: null,
    });
  });
});
