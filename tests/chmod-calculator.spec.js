import { test, expect } from "@playwright/test";

test("Chmod Calculator tool loads and reacts to input", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/chmod-calculator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Chmod Calculator");

  const octal = page.locator("#cc-octal");
  await expect(octal).toBeAttached();
  await expect(octal).toHaveValue("755");

  await expect(page.locator("#cc-symbolic")).toContainText("-rwxr-xr-x");
  await expect(page.locator("#cc-command")).toContainText("chmod 755 myfile");

  await octal.fill("644");
  await octal.press("Enter");
  await expect(page.locator("#cc-symbolic")).toContainText("-rw-r--r--");
  await expect(page.locator("#cc-command")).toContainText("chmod 644 myfile");

  await page.locator('button.cc-preset[data-octal="777"]').click();
  await expect(octal).toHaveValue("777");
  await expect(page.locator("#cc-symbolic")).toContainText("-rwxrwxrwx");

  await page.locator("#cc-owner-w").uncheck();
  await expect(octal).toHaveValue("577");

  await page.locator("#cc-sticky").check();
  await expect(octal).toHaveValue("1577");
  await expect(page.locator("#cc-symbolic")).toContainText("t");

  console.log("✅ Chmod Calculator tool loads and reacts correctly");
});
