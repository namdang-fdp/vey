import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

export type AuthFlowError = { message: string };

export function authError(error: unknown): AuthFlowError {
  if (isClerkAPIResponseError(error) && error.errors.length > 0) {
    const first = error.errors[0];
    const message = first?.longMessage || first?.message;
    if (typeof message === "string" && message.trim()) {
      return { message: message.trim() };
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown[] }).errors) &&
    (error as { errors: unknown[] }).errors.length > 0
  ) {
    const first = (
      error as { errors: Array<{ longMessage?: string; message?: string }> }
    ).errors[0];
    const message = first?.longMessage || first?.message;
    if (typeof message === "string" && message.trim()) {
      return { message: message.trim() };
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return { message: error.message.trim() };
  }

  return {
    message: "Authentication could not be completed. Please try again.",
  };
}

export function incompleteFlowError(): AuthFlowError {
  return {
    message: "Additional account verification is required to continue.",
  };
}
