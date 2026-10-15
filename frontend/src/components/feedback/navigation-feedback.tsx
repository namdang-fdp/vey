"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { toast } from "@/lib/notifications";

const screens: Record<string, string> = {
  [routes.home]: "Home",
  [routes.login]: "Sign in",
  [routes.register]: "Create account",
  [routes.forgotPassword]: "Password recovery",
  [routes.resetPassword]: "Reset password",
  [routes.authComplete]: "Preparing workspace",
  [routes.meetings]: "Meetings",
  [routes.terms]: "Terms of Service",
  [routes.privacy]: "Privacy Policy",
};

export function NavigationFeedback() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const screen = screens[pathname];
    if (screen)
      toast.info(`${screen} is now open.`, {
        title: screen,
      });
  }, [pathname]);
  return null;
}
