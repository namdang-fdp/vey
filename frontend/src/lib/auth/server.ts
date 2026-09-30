import "server-only";

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { after } from "next/server";
import {
  assertAuthEmailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email/server";

const databaseUrl = process.env.BETTER_AUTH_DATABASE_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!databaseUrl) {
  throw new Error("BETTER_AUTH_DATABASE_URL is required");
}

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required");
}

// Reuse connections across development HMR; production keeps one pool per process.
const authGlobal = globalThis as typeof globalThis & { veyAuthPool?: Pool };
const pool =
  authGlobal.veyAuthPool ?? new Pool({ connectionString: databaseUrl });
if (process.env.NODE_ENV !== "production") authGlobal.veyAuthPool = pool;

export const auth = betterAuth({
  appName: "Vey",
  baseURL: process.env.BETTER_AUTH_URL,
  secret,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      assertAuthEmailConfigured("password-reset");
      after(async () => {
        try {
          await sendPasswordResetEmail(user, url);
        } catch {
          console.error("Password reset email delivery failed");
        }
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }) => {
      assertAuthEmailConfigured("verification");
      after(async () => {
        try {
          await sendVerificationEmail(user, url);
        } catch {
          console.error("Verification email delivery failed");
        }
      });
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          },
        }
      : {}),
  },
  database: {
    dialect: new PostgresDialect({ pool }),
    type: "postgres",
    schemaName: "auth",
  },
  plugins: [jwt()],
});
