import { expect, test } from "@playwright/test";

test("password toggles preserve text, stay independent and work with the keyboard", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("/register");
  const password = page.getByLabel("Password", { exact: true });
  const confirmation = page.getByLabel("Confirm password", { exact: true });
  await password.fill("Ui-visibility-example");
  await confirmation.fill("Ui-visibility-example");
  const show = page.getByRole("button", { name: "Show password", exact: true });
  await show.click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(confirmation).toHaveAttribute("type", "password");
  const hide = page.getByRole("button", { name: "Hide password", exact: true });
  await expect(hide).toHaveAttribute("aria-pressed", "true");
  await hide.focus();
  await page.keyboard.press("Space");
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveValue("Ui-visibility-example");
  await expect(
    page.getByRole("heading", { name: "Create your Vey account" }),
  ).toBeVisible();

  await page.goto("/reset-password?token=ui-preview-only");
  await page
    .getByRole("button", { name: "Show confirmation password" })
    .click();
  await expect(
    page.getByLabel("New password", { exact: true }),
  ).toHaveAttribute("type", "password");
  await expect(
    page.getByLabel("Confirm new password", { exact: true }),
  ).toHaveAttribute("type", "text");
  for (let index = 0; index < 6; index += 1) {
    await page
      .getByRole("button", {
        name:
          index % 2 === 0
            ? "Hide confirmation password"
            : "Show confirmation password",
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Set a new password" }),
  ).toBeVisible();
  await page.goto("/login");
  for (let index = 0; index < 6; index += 1) {
    await page
      .getByRole("button", {
        name: index % 2 === 0 ? "Show password" : "Hide password",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Sign in to Vey" }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`mobile Goey errors stay readable and dismissible (${reducedMotion})`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion });
    await page.route("**/api/auth/sign-in/email", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          code: "INVALID_EMAIL_OR_PASSWORD",
          message: "Invalid email or password",
        }),
      }),
    );
    await page.goto("/login");
    await page.getByLabel("Email address").fill("ui-test@example.test");
    await page.getByLabel("Password", { exact: true }).fill("Ui-test-password");
    const toggle = page.getByRole("button", {
      name: "Show password",
      exact: true,
    });
    const box = await toggle.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await toggle.click();
    await page
      .getByRole("button", { name: "Hide password", exact: true })
      .press("Space");
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
      "type",
      "password",
    );
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    const toast = page.locator(".vey-toast[role=alert]");
    await expect(toast).toContainText("Email or password is incorrect.");
    await expect(toast.locator(".gooey-iconWrapper svg")).toBeVisible();
    const description = toast.locator(".gooey-description");
    await expect(description).toHaveText("Email or password is incorrect.");
    await expect(description).toBeVisible();
    await expect
      .poll(() =>
        description.evaluate(
          (element) =>
            element.scrollHeight <= element.clientHeight &&
            element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        toast.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return (
            bounds.top >= 0 &&
            bounds.bottom <= innerHeight &&
            getComputedStyle(element).opacity === "1"
          );
        }),
      )
      .toBe(true);
    await expect(description).toBeInViewport();
    await page.screenshot({
      path: testInfo.outputPath("toast-error-mobile.png"),
    });
    const close = toast.getByRole("button", { name: "Close toast" });
    expect(
      await close.evaluate((element) => getComputedStyle(element).opacity),
    ).toBe("1");
    await expect(toast).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("[data-sonner-toaster]")).toHaveAttribute(
      "data-x-position",
      "right",
    );
    await expect(page.locator("[data-sonner-toaster]")).toHaveAttribute(
      "data-y-position",
      "bottom",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const toastBox = await toast.boundingBox();
    expect(toastBox?.x).toBeGreaterThanOrEqual(0);
    expect((toastBox?.x ?? 0) + (toastBox?.width ?? 0)).toBeLessThanOrEqual(
      375,
    );
    await close.click();
    await expect(toast).toHaveCount(0);
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
      "Ui-test-password",
    );
  });
}

test("resending verification uses the shared dark info toast", async ({
  page,
}) => {
  await page.route("**/api/auth/sign-up/email", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: null }),
    }),
  );
  await page.route("**/api/auth/send-verification-email", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true }),
    }),
  );
  await page.goto("/register");
  await page.getByLabel("Name", { exact: true }).fill("UI test");
  await page.getByLabel("Email address").fill("ui-test@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Ui-test-password");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Ui-test-password");
  await page.getByRole("button", { name: "Create account" }).click();
  const success = page
    .locator(".vey-toast")
    .filter({ has: page.locator(".gooey-titleSuccess") });
  await expect(success.locator(".gooey-iconWrapper svg")).toBeVisible();
  await page.getByRole("button", { name: "Resend verification email" }).click();
  const toast = page
    .locator(".vey-toast[role=status]")
    .filter({ has: page.locator(".gooey-titleInfo") });
  await expect(toast).toContainText(
    "If this address needs verification, a new link is on its way.",
  );
  await expect(toast).toHaveAttribute("data-theme", "dark");
  await expect(toast.locator(".gooey-titleInfo")).toBeVisible();
  await expect(toast.locator(".gooey-description")).toBeInViewport();
});

test("screen changes show navigation feedback through the shared toaster", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Register", exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(
    page
      .locator(".vey-toast")
      .filter({ hasText: "Create account is now open." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.locator(".vey-toast").filter({ hasText: "Sign in is now open." }),
  ).toBeVisible();
});
