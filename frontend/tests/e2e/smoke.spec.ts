import { expect, test } from "@playwright/test";

test("Vey shell routes render", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Vey workspace" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("API connected");
  await page.getByRole("link", { name: "Meetings" }).click();
  await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});
