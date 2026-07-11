import { test, expect } from "@playwright/test";

test.describe("Email Signature Generator", () => {
  test("loads and renders the tool", async ({ page }) => {
    await page.goto("/#/tools/email-signature-generator");
    await expect(page.locator("h1")).toContainText("Email Signature Generator");
    await expect(page.locator("#sig-preview")).toBeVisible();
    await expect(page.locator("#sig-name")).toBeVisible();
  });

  test("updates preview on input", async ({ page }) => {
    await page.goto("/#/tools/email-signature-generator");
    await page.fill("#sig-name", "John Doe");
    await page.fill("#sig-title", "Software Engineer");
    await page.fill("#sig-email", "john@example.com");
    const preview = page.locator("#sig-preview");
    await expect(preview).toContainText("John Doe");
    await expect(preview).toContainText("Software Engineer");
  });

  test("copy button works", async ({ page }) => {
    await page.goto("/#/tools/email-signature-generator");
    await page.fill("#sig-name", "Test User");
    await page.fill("#sig-email", "test@example.com");
    await page.click("#sig-copy");
    const toast = page.locator("#sig-toast");
    await expect(toast).toContainText("copied");
  });

  test("reset clears fields", async ({ page }) => {
    await page.goto("/#/tools/email-signature-generator");
    await page.fill("#sig-name", "John Doe");
    await page.click("#sig-reset");
    page.on("dialog", dialog => dialog.accept());
    await expect(page.locator("#sig-name")).toHaveValue("");
  });
});
