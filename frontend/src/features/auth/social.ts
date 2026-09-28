// Strategies only; each provider must be enabled in the Clerk Dashboard.
export const socialStrategies = {
  google: "oauth_google",
  github: "oauth_github",
  facebook: "oauth_facebook",
} as const;

export type SocialProvider = keyof typeof socialStrategies;
