import type { SetActiveNavigate } from "@clerk/nextjs/types";
import { safeReturnTo } from "./paths";

export function navigateAfterAuth(
  router: { replace: (href: string) => void },
  returnTo: string,
): SetActiveNavigate {
  const destination = safeReturnTo(returnTo);
  return ({ session, decorateUrl }) => {
    if (session?.currentTask) {
      // A pending Clerk task is not a Vey application session.
      router.replace("/auth/session-task");
      return;
    }
    const url = decorateUrl(destination);
    if (url.startsWith("http")) {
      window.location.assign(url);
    } else {
      router.replace(url);
    }
  };
}
