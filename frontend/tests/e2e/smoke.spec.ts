import { expect, test } from "@playwright/test";

test("root leads to the Vey login page and meetings workspace exists", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Sign in to Vey" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "Vey" })).toBeVisible();

  await page.goto("/meetings");
  await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();
});
