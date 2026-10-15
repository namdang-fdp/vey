import "server-only";

import { Resend } from "resend";

type AuthEmailKind = "verification" | "password-reset";

function getEmailConfig(kind: AuthEmailKind) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const templateId =
    kind === "verification"
      ? process.env.RESEND_VERIFY_EMAIL_TEMPLATE_ID
      : process.env.RESEND_RESET_PASSWORD_TEMPLATE_ID;

  if (!apiKey || !from || !templateId) {
    throw new Error(`Resend ${kind} email configuration is incomplete`);
  }

  return { apiKey, from, templateId };
}

export function assertAuthEmailConfigured(kind: AuthEmailKind) {
  getEmailConfig(kind);
}

async function sendAuthEmail(
  kind: AuthEmailKind,
  to: string,
  variables: Record<string, string>,
) {
  const { apiKey, from, templateId } = getEmailConfig(kind);
  const { data, error } = await new Resend(apiKey).emails.send({
    from,
    to,
    template: { id: templateId, variables },
  });

  if (error || !data?.id) {
    console.error("Auth email delivery failed", {
      kind,
      errorName: error?.name ?? "EMPTY_RESPONSE",
      statusCode: error?.statusCode ?? null,
    });
    throw new Error(`Unable to send ${kind} email`);
  }
}

export function sendVerificationEmail(
  user: { email: string; name: string },
  url: string,
) {
  return sendAuthEmail("verification", user.email, {
    USER_NAME: user.name?.trim() || "there",
    VERIFICATION_URL: url,
  });
}

export function sendPasswordResetEmail(
  user: { email: string; name: string },
  url: string,
) {
  return sendAuthEmail("password-reset", user.email, {
    USER_NAME: user.name?.trim() || "there",
    RESET_URL: url,
  });
}
