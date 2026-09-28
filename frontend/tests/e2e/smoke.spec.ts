import { expect, test } from "@playwright/test";

test("public authentication routes render with the Vey brand", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "Vey" })).toBeVisible();

  await page.goto("/register");
  await expect(page).toHaveURL(/\/register$/);
  await expect(
    page.getByRole("heading", { name: "Create an account" }),
  ).toBeVisible();

  await page.goto("/forgot-password");
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(
    page.getByRole("heading", { name: "Reset your password" }),
  ).toBeVisible();
});

test("signed-out visitors are sent to login before protected content", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/meetings");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fmeetings$/);

  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fsettings$/);
});
