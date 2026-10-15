import { expect, test } from "@playwright/test";

test("login exposes real social actions and validates credentials locally", async ({
  page,
}) => {
  const signInRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/auth/sign-in/email")
      signInRequests.push(request.url());
  });

  await page.goto("/login");
  for (const provider of ["Google", "GitHub", "Facebook"]) {
    await expect(
      page.getByRole("button", { name: `Continue with ${provider}` }),
    ).toBeVisible();
  }

  await page.getByLabel("Email address").fill("invalid-email");
  await page.getByLabel("Password", { exact: true }).fill("simple");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText("Please enter a valid email address"),
  ).toBeVisible();
  expect(signInRequests).toHaveLength(0);
});

test("forgot and reset pages show safe recovery states", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Email address is required")).toBeVisible();
  await page.goto("/reset-password");
  await expect(page.getByText("Reset link unavailable")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Request a new link" }),
  ).toHaveAttribute("href", "/forgot-password");
});
