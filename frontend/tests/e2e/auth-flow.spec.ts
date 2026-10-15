import { expect, test } from "@playwright/test";

test("registration validates locally and requires verification before application access", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Email address is required")).toBeVisible();
  await expect(
    page.getByText("Password must be at least 8 characters"),
  ).toBeVisible();

  await page.getByLabel("Name").fill("Vey User");
  await page.getByLabel("Email address").fill("user@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("different123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Passwords do not match")).toBeVisible();

  await page.goto("/meetings");
  await expect(page).toHaveURL(/\/login$/);
});
