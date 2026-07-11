import { test, expect } from "@playwright/test";

test("Markdown Table Generator tool loads and reacts to input", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/markdown-table-generator");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Markdown Table Generator");

  await expect(page.locator("#mtg-grid")).toBeAttached();
  await expect(page.locator("#mtg-output")).toBeAttached();
  await expect(page.locator("#mtg-copy")).toBeAttached();
  await expect(page.locator("#mtg-download")).toBeAttached();
  await expect(page.locator("#mtg-add-row")).toBeAttached();
  await expect(page.locator("#mtg-add-col")).toBeAttached();

  const initial = await page.locator("#mtg-output").textContent();
  expect(initial).toContain("| Name | Value | Notes |");
  expect(initial).toContain("| :--- |");

  await page.locator("#mtg-import-text").fill("a,b,c\n1,2,3");
  await page.locator("#mtg-import").click();
  await expect(page.locator("#mtg-output")).toContainText("| a | b | c |");
  await expect(page.locator("#mtg-output")).toContainText("| 1 | 2 | 3 |");

  const col2Align = page.locator("select.mtg-a").nth(1);
  await col2Align.selectOption("right");
  await expect(page.locator("#mtg-output")).toContainText("---:");

  await page.locator("#mtg-add-row").click();
  const rowCount = await page.locator("input.mtg-c").count();
  expect(rowCount).toBeGreaterThan(3);

  console.log("Markdown Table Generator tool loads and reacts correctly");
});
