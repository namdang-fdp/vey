type ErrorRecord = Record<string, unknown>;

function asRecord(value: unknown): ErrorRecord | undefined {
  return value && typeof value === "object"
    ? (value as ErrorRecord)
    : undefined;
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const record = asRecord(error);
  const details = asRecord(record?.error);
  const code = record?.code ?? details?.code;

  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Email or password is incorrect.";
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
    case "USER_ALREADY_EXISTS":
      return "An account with this email already exists. Try signing in.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "INVALID_PASSWORD":
      return "Please choose a password with at least 8 characters.";
    default:
      return fallback;
  }
}
