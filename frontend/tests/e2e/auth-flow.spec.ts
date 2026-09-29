import { expect, test } from "@playwright/test";

test("register, protected route, login and logout use a Better Auth session", async ({
  page,
}) => {
  const email = `vey-ba2-smoke-${Date.now()}@example.com`;
  const password = "VeyManualSmoke123";

  await page.goto("/register");
  await page.getByLabel("Name").fill("Vey BA2 Smoke");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/meetings$/);
  await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();
  const activeSessionResponse = await page.request.get("/api/auth/get-session");
  const activeSession = await activeSessionResponse.json();
  expect(activeSession.user.email).toBe(email);
  expect(activeSession.session.userId).toBe(activeSession.user.id);
  const sessionCookie = (await page.context().cookies()).find((cookie) =>
    cookie.name.includes("session_token"),
  );
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie?.httpOnly).toBe(true);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/meetings");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/meetings$/);
  await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/meetings");
  await expect(page).toHaveURL(/\/login$/);
});
