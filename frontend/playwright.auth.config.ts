import { defineConfig, devices } from "@playwright/test";

const database = process.env.VEY_AUTH_TEST_DATABASE_URL;
if (
  !database ||
  !/^\/vey_auth_test_[a-f0-9]{16}$/.test(new URL(database).pathname)
) {
  throw new Error(
    "Run bun run test:auth to provision an isolated test database",
  );
}

export default defineConfig({
  testDir: "./tests/auth-e2e",
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    // Cookies/JWTs are credentials: don't retain traces, HARs or storage-state files.
    trace: "off",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
