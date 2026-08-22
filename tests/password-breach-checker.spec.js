import { expect, test } from "@playwright/test";

test("password-breach-checker renders and validates empty input", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/password-breach-checker");
  await expect(page.locator(".tool-header h1")).toHaveText("Password Breach Checker");

  await page.click("#pbc-go");
  await expect(page.locator("#pbc-out")).toContainText("Type a password first");

  const input = page.locator("#pbc-input");
  await expect(input).toHaveAttribute("type", "password");
  await page.click("#pbc-eye");
  await expect(input).toHaveAttribute("type", "text");
  await page.click("#pbc-eye");
  await expect(input).toHaveAttribute("type", "password");
});
