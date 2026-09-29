import "server-only";

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

const databaseUrl = process.env.BETTER_AUTH_DATABASE_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!databaseUrl) {
  throw new Error("BETTER_AUTH_DATABASE_URL is required");
}

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET is required");
}

const pool = new Pool({ connectionString: databaseUrl });

export const auth = betterAuth({
  appName: "Vey",
  baseURL: process.env.BETTER_AUTH_URL,
  secret,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  database: {
    dialect: new PostgresDialect({ pool }),
    type: "postgres",
    schemaName: "auth",
  },
  plugins: [jwt()],
});
