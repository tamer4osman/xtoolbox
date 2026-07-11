import { test, expect } from "@playwright/test";

test("hmac-generator loads and generates", async ({ page }) => {
  await page.goto("/#/tools/hmac-generator");
  await expect(page.locator("h1")).toContainText("HMAC Generator");

  await page.fill("#hmac-message", "hello world");
  await page.fill("#hmac-secret", "my-secret");

  const hex = page.locator("#hmac-hex");
  await expect(hex).not.toBeEmpty();
  await expect(hex).toHaveValue(/^[0-9a-f]+$/);
});

test("hmac-generator switches to verify mode", async ({ page }) => {
  await page.goto("/#/tools/hmac-generator");
  await page.click('[data-mode="verify"]');
  await expect(page.locator("#verify-output")).toBeVisible();
  await expect(page.locator("#generate-output")).toBeHidden();
});
