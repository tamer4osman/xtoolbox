import { test, expect } from "@playwright/test";

test("browser-fingerprint-checker loads and shows results", async ({
  page
}) => {
  await page.goto(
    "http://localhost:3000/#/tools/browser-fingerprint-checker"
  );

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Browser Fingerprint Checker");

  const privacy = await page.locator(".bfc-privacy");
  await expect(privacy).toBeVisible();

  const runBtn = await page.locator("#bfc-run");
  await expect(runBtn).toBeVisible();
  await expect(runBtn).toHaveText("Run Fingerprint Check");

  const results = await page.locator("#bfc-results");
  await expect(results).toHaveAttribute("style", /display:none/);

  await runBtn.click();

  await page.waitForSelector("#bfc-hash-value:not(:empty)", {
    timeout: 5000
  });

  const hash = await page.locator("#bfc-hash-value").textContent();
  expect(hash.length).toBe(16);
  expect(hash).toMatch(/^[0-9a-f]+$/);

  const rows = await page.locator("#bfc-table-body tr").count();
  expect(rows).toBeGreaterThan(10);

  await expect(runBtn).toHaveText("Run Again");

  console.log("✅ Browser Fingerprint Checker loads correctly");
});
