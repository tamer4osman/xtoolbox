import { expect, test } from "@playwright/test";

test("link-preview renders controls and preset fills input", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/link-preview");
  await expect(page.locator(".tool-header h1")).toHaveText("Link Preview Generator");

  await expect(page.locator("#lp-out")).toContainText("Paste a URL");

  await page.click(".lp-preset >> nth=0");
  await expect(page.locator("#lp-url")).toHaveValue(/github\.com\/microlinkhq/);

  await page.fill("#lp-url", "not a url at all");
  await page.click("#lp-go");
  await expect(page.locator("#lp-out")).toContainText("valid http");
});
