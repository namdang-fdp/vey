import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { Pool } from "pg";

const database = new Pool({
  connectionString: process.env.VEY_AUTH_TEST_DATABASE_URL,
});
const origin = "http://localhost:3100";
const backend = "http://localhost:8082";
const userId = randomUUID();
const email = `auth-${userId}@example.test`;
const oldPassword = "Vey-test-original-912!";
const newPassword = "Vey-test-updated-734!";
let relay: Server;
let revocations = 0;
let failRevocation = 0;

test.beforeAll(async () => {
  // The relay injects an outage after the reset cutoff is accepted but before device deletion.
  // Only this disposable server's private requests pass through it; no tokens are logged.
  relay = createServer(async (request, response) => {
    if (request.url === "/api/v1/auth/identity/revoke") {
      revocations += 1;
      if (failRevocation === revocations) {
        response.writeHead(503).end();
        return;
      }
    }
    try {
      const result = await fetch(`${backend}${request.url}`, {
        method: request.method,
        headers: {
          ...(request.headers.authorization
            ? { Authorization: request.headers.authorization }
            : {}),
          ...(request.headers.cookie ? { Cookie: request.headers.cookie } : {}),
        },
        signal: AbortSignal.timeout(5000),
      });
      response.writeHead(result.status, { "content-type": "application/json" });
      response.end(await result.text());
    } catch {
      response.writeHead(503).end();
    }
  });
  await new Promise<void>((resolve) => relay.listen(8083, resolve));
  await database.query(
    'INSERT INTO auth."user" (id,name,email,"emailVerified") VALUES ($1,$2,$3,true)',
    [userId, "Auth lifecycle test", email],
  );
  await database.query(
    'INSERT INTO auth.account (id,"accountId","providerId","userId",password,"updatedAt") VALUES ($1,$2,\'credential\',$2,$3,now())',
    [randomUUID(), userId, await hashPassword(oldPassword)],
  );
});

test.afterAll(async () => {
  if (relay)
    await new Promise<void>((resolve, reject) =>
      relay.close((error) => (error ? reject(error) : resolve())),
    );
  await database.end();
});

async function login(page: Page, password = oldPassword) {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const submitted = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/sign-in/email"),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const response = await submitted;
  if (response.status() === 429) {
    // Four rapid sign-ins share localhost's production rate limiter; respect its window.
    const seconds = Math.max(
      1,
      Number(response.headers()["retry-after"]) || 10,
    );
    await page.waitForTimeout((seconds + 1) * 1000);
    const retried = page.waitForResponse((result) =>
      result.url().endsWith("/api/auth/sign-in/email"),
    );
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    expect((await retried).status()).toBe(200);
  } else {
    expect(response.status()).toBe(200);
  }
  await expect(page).toHaveURL(/\/meetings$/, { timeout: 30_000 });
  expect((await page.request.get(`${backend}/api/v1/auth/me`)).status()).toBe(
    200,
  );
}

async function ownedRecords() {
  const {
    rows: [counts],
  } = await database.query(
    `SELECT (SELECT count(*)::int FROM iam.users WHERE auth_user_id=$1) AS users,
      (SELECT count(*)::int FROM iam.workspaces w JOIN iam.users u ON w.initial_for_user_id=u.id WHERE u.auth_user_id=$1) AS workspaces,
      (SELECT count(*)::int FROM iam.workspace_memberships m JOIN iam.users u ON m.user_id=u.id WHERE u.auth_user_id=$1) AS memberships`,
    [userId],
  );
  expect(counts).toEqual({ users: 1, workspaces: 1, memberships: 1 });
}

async function passport(context: BrowserContext): Promise<string> {
  const result = await context.request.get(`${origin}/api/auth/token`);
  expect(result.status()).toBe(200);
  const data = await result.json();
  expect(typeof data.token).toBe("string");
  return data.token;
}

test("real cookies survive refresh, recover expiry, revoke devices and retry an interrupted password reset", async ({
  page,
  context,
  browser,
}) => {
  await login(page);
  await ownedRecords();
  const firstCookies = await context.cookies();
  const veyCookie = firstCookies.find(
    (cookie) => cookie.name === "vey_session",
  );
  expect(Boolean(veyCookie)).toBe(true);
  await page.reload();
  await expect(page).toHaveURL(/\/meetings$/);
  await ownedRecords();

  // Better Auth expiry must not invalidate an otherwise valid application session.
  await database.query(
    'UPDATE auth.session SET "expiresAt"=now()-interval \'1 second\' WHERE "userId"=$1',
    [userId],
  );
  await page.reload();
  await expect(page).toHaveURL(/\/meetings$/);
  expect((await page.request.get(`${backend}/api/v1/auth/me`)).status()).toBe(
    200,
  );

  // Both sessions expired -> login, not an exchange loop.
  await database.query(
    "UPDATE iam.sessions SET expires_at=now()-interval '1 second' WHERE status='ACTIVE'",
  );
  await page.goto("/meetings");
  await expect(page).toHaveURL(/\/login$/);
  await login(page);

  // Only Vey expires -> exchange from the valid identity and preserve ownership.
  const beforeRecovery = (await context.cookies()).find(
    (cookie) => cookie.name === "vey_session",
  )?.value;
  await database.query(
    "UPDATE iam.sessions SET expires_at=now()-interval '1 second' WHERE status='ACTIVE'",
  );
  await page.reload();
  await expect(page).toHaveURL(/\/meetings$/, { timeout: 30_000 });
  const afterRecovery = (await context.cookies()).find(
    (cookie) => cookie.name === "vey_session",
  )?.value;
  expect(Boolean(afterRecovery) && afterRecovery !== beforeRecovery).toBe(true);
  await ownedRecords();

  const second = await browser.newContext();
  try {
    const secondPage = await second.newPage();
    await login(secondPage);
    const oldPassport = await passport(context);
    const secondPassport = await passport(second);
    const resetToken = randomUUID();
    await database.query(
      "INSERT INTO auth.verification (id,identifier,value,\"expiresAt\") VALUES ($1,$2,$3,now()+interval '1 hour')",
      [randomUUID(), `reset-password:${resetToken}`, userId],
    );
    revocations = 0;
    failRevocation = 2;
    const interrupted = await context.request.post(
      `${origin}/api/auth/reset-password`,
      {
        headers: { Origin: origin },
        data: { token: resetToken, newPassword },
      },
    );
    expect(interrupted.status()).toBe(503);
    expect(revocations).toBe(2);
    const {
      rows: [account],
    } = await database.query(
      'SELECT password FROM auth.account WHERE "userId"=$1',
      [userId],
    );
    expect(
      await verifyPassword({ hash: account.password, password: oldPassword }),
    ).toBe(true);
    const {
      rows: [remaining],
    } = await database.query(
      "SELECT count(*)::int AS count FROM auth.verification WHERE identifier=$1",
      [`reset-password:${resetToken}`],
    );
    expect(remaining.count).toBe(1);
    const {
      rows: [devices],
    } = await database.query(
      'SELECT count(*)::int AS count FROM auth.session WHERE "userId"=$1',
      [userId],
    );
    expect(devices.count).toBeGreaterThanOrEqual(2);
    // The first accepted revocation remains fail-closed even though identity writes rolled back.
    expect(
      (await context.request.get(`${backend}/api/v1/auth/me`)).status(),
    ).toBe(401);
    expect(
      (await second.request.get(`${backend}/api/v1/auth/me`)).status(),
    ).toBe(401);

    failRevocation = 0;
    const retry = await context.request.post(
      `${origin}/api/auth/reset-password`,
      {
        headers: { Origin: origin },
        data: { token: resetToken, newPassword },
      },
    );
    expect(retry.status()).toBe(200);
    const {
      rows: [consumed],
    } = await database.query(
      "SELECT count(*)::int AS count FROM auth.verification WHERE identifier=$1",
      [`reset-password:${resetToken}`],
    );
    expect(consumed.count).toBe(0);
    const {
      rows: [updated],
    } = await database.query(
      'SELECT password FROM auth.account WHERE "userId"=$1',
      [userId],
    );
    expect(
      await verifyPassword({ hash: updated.password, password: newPassword }),
    ).toBe(true);
    expect(
      (await context.request.get(`${origin}/api/auth/get-session`)).status(),
    ).toBe(200);
    expect(
      await (
        await context.request.get(`${origin}/api/auth/get-session`)
      ).json(),
    ).toBeNull();
    expect(
      await (await second.request.get(`${origin}/api/auth/get-session`)).json(),
    ).toBeNull();
    for (const token of [oldPassport, secondPassport]) {
      expect(
        (
          await context.request.post(`${backend}/api/v1/auth/session`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ).status(),
      ).toBe(401);
    }
    await login(page, newPassword);
    await ownedRecords();
    await page
      .getByRole("button", { name: "Sign out", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login$/);
    expect(
      (await context.request.get(`${backend}/api/v1/auth/me`)).status(),
    ).toBe(401);
    expect(
      await (
        await context.request.get(`${origin}/api/auth/get-session`)
      ).json(),
    ).toBeNull();
  } finally {
    await second.close();
  }
});
