import { routes } from "./routes";

export const publicNavigation = [
  { label: "Meetings", href: routes.meetings },
  { label: "Log in", href: routes.login },
] as const;

export const applicationNavigation = [
  { label: "Meetings", href: routes.meetings },
] as const;
