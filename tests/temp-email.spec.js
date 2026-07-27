import { test, expect } from "@playwright/test";

test("Temp Email tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/temp-email");

  await page.waitForSelector(".tool-container", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Temp Email");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("temporary disposable email");

  const createBtn = page.locator("#create-btn");
  await expect(createBtn).toBeAttached();
  await expect(createBtn).toHaveText("Create Temp Email");

  const emailDisplay = page.locator("#email-display");
  await expect(emailDisplay).toBeHidden();

  const inboxPanel = page.locator("#inbox-panel");
  await expect(inboxPanel).toBeHidden();

  const messageView = page.locator("#message-view");
  await expect(messageView).toBeHidden();

  console.log("✅ Temp Email tool loads correctly");
});
