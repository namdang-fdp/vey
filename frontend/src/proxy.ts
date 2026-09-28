import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function isProtectedPath(pathname: string): boolean {
  return /^\/(meetings|settings)(\/|$)/.test(pathname);
}

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedPath(request.nextUrl.pathname)) {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      const login = new URL("/login", request.url);
      login.searchParams.set(
        "returnTo",
        request.nextUrl.pathname + request.nextUrl.search,
      );
      return NextResponse.redirect(login);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/(.*)",
  ],
};
