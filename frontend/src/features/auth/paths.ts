export const authPaths = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  ssoCallback: "/auth/sso-callback",
  meetings: "/meetings",
} as const;

// Return intent is limited to Clerk-gated pages. Vey authorization is not present yet.
export function safeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x1f\x7f]/.test(value)
  ) {
    return authPaths.meetings;
  }

  try {
    const url = new URL(value, "https://vey.invalid");
    if (
      url.origin !== "https://vey.invalid" ||
      !/^\/(meetings|settings)(\/|$)/.test(url.pathname)
    ) {
      return authPaths.meetings;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return authPaths.meetings;
  }
}

export function authLink(path: string, returnTo: string): string {
  return `${path}?${new URLSearchParams({ returnTo: safeReturnTo(returnTo) })}`;
}
