import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

// Each run owns a disposable database and processes; it never mutates the developer database.
const root = fileURLToPath(new URL("../", import.meta.url));
const source = process.env.BETTER_AUTH_DATABASE_URL;
if (!source) throw new Error("BETTER_AUTH_DATABASE_URL is required");
const databaseName = `vey_auth_test_${randomBytes(8).toString("hex")}`;
const databaseUrl = new URL(source);
databaseUrl.pathname = `/${databaseName}`;
const admin = new Pool({ connectionString: source });
const testDatabase = new Pool({ connectionString: databaseUrl.toString() });
const owned: ChildProcess[] = [];
const env = {
  ...process.env,
  BETTER_AUTH_DATABASE_URL: databaseUrl.toString(),
  VEY_AUTH_TEST_DATABASE_URL: databaseUrl.toString(),
  BETTER_AUTH_URL: "http://localhost:3100",
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8082",
  VEY_API_INTERNAL_URL: "http://localhost:8083",
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
};

async function launch(
  command: string,
  args: string[],
  name: string,
  cwd = root,
) {
  const log = await open(`${root}.cache/auth-e2e/${name}.log`, "w");
  const child = spawn(command, args, {
    cwd,
    env,
    detached: true,
    stdio: ["ignore", log.fd, log.fd],
  });
  owned.push(child);
  await log.close();
  return child;
}

async function ready(url: string, child: ChildProcess) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error("Test server exited; see .cache/auth-e2e");
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(2000) })).ok) return;
    } catch {
      /* Still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Test server readiness timed out; see .cache/auth-e2e");
}

let created = false;
try {
  await mkdir(`${root}.cache/auth-e2e`, { recursive: true });
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  created = true;
  await testDatabase.query(
    await readFile(`${root}better-auth-schema.sql`, "utf8"),
  );
  const jdbc = new URL(databaseUrl);
  jdbc.username = "";
  jdbc.password = "";
  Object.assign(env, {
    SPRING_DATASOURCE_URL: `jdbc:${jdbc.toString()}`,
    SPRING_DATASOURCE_USERNAME: decodeURIComponent(databaseUrl.username),
    SPRING_DATASOURCE_PASSWORD: decodeURIComponent(databaseUrl.password),
    SPRING_DATA_REDIS_HOST: "localhost",
    SPRING_DATA_REDIS_PORT: "6379",
    SPRING_KAFKA_BOOTSTRAP_SERVERS: "localhost:9092",
    VEY_AUTH_ISSUER: env.BETTER_AUTH_URL,
    VEY_AUTH_AUDIENCE: env.BETTER_AUTH_URL,
    VEY_AUTH_JWKS_URI: `${env.BETTER_AUTH_URL}/api/auth/jwks`,
    VEY_CORS_ALLOWED_ORIGIN: env.BETTER_AUTH_URL,
    VEY_AUTH_COOKIE_SECURE: "false",
  });
  const backend = await launch(
    "java",
    [
      "-jar",
      "../api/target/vey-api-0.0.1-SNAPSHOT.jar",
      "--server.port=8082",
      "--org.jobrunr.background-job-server.enabled=false",
    ],
    "backend",
  );
  await ready("http://localhost:8082/actuator/health", backend);
  const build = await launch("bun", ["run", "build"], "build");
  const built = await new Promise<number>((resolve, reject) => {
    build.on("error", reject);
    build.on("exit", (code) => resolve(code ?? 1));
  });
  if (built !== 0)
    throw new Error("Test build failed; see .cache/auth-e2e/build.log");
  const frontend = await launch(
    "bun",
    ["run", "start", "--port", "3100"],
    "frontend",
  );
  await ready("http://localhost:3100/api/auth/ok", frontend);
  const tests = spawn(
    "bun",
    ["x", "playwright", "test", "--config", "playwright.auth.config.ts"],
    {
      cwd: root,
      env,
      stdio: "inherit",
    },
  );
  const code = await new Promise<number>((resolve, reject) => {
    tests.on("error", reject);
    tests.on("exit", (value) => resolve(value ?? 1));
  });
  if (code !== 0) throw new Error("Auth lifecycle regression failed");
} finally {
  for (const child of owned.reverse()) {
    if (child.pid && child.exitCode === null) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        /* Already stopped. */
      }
    }
  }
  await testDatabase.end();
  if (created && /^vey_auth_test_[a-f0-9]{16}$/.test(databaseName)) {
    await admin.query(`DROP DATABASE "${databaseName}" WITH (FORCE)`);
  }
  await admin.end();
}
