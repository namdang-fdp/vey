import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/server";
import { resetPasswordTransaction } from "@/lib/auth/password-reset";

const handlers = toNextJsHandler(auth);
export const GET = handlers.GET;

export async function POST(request: Request) {
  if (new URL(request.url).pathname === "/api/auth/reset-password") {
    return resetPasswordTransaction(request);
  }
  const response = await handlers.POST(request);
  if (new URL(request.url).pathname !== "/api/auth/sign-out" || !response.ok)
    return response;
  try {
    // Better Auth catches deletion errors in signOut. Verify using the original cookie before
    // forwarding its cookie deletions, so a failed identity logout remains retryable.
    const remaining = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });
    if (!remaining) return response;
  } catch {
    // An unavailable identity store cannot establish successful logout.
  }
  return Response.json(
    { message: "Unable to finish signing out. Please try again." },
    { status: 503 },
  );
}
