export const routes = {
  home: "/",
  login: "/login",
  meetings: "/meetings",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  terms: "/terms",
  privacy: "/privacy",
  oauth: {
    google: "/login/oauth/google",
    github: "/login/oauth/github",
    facebook: "/login/oauth/facebook",
  },
} as const;
