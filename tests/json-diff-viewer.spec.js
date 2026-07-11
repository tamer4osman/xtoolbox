import { test, expect } from "@playwright/test";

test("JSON Diff Viewer loads and compares", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/json-diff-viewer");
  await page.waitForSelector(".jdv-container", { timeout: 5000 });

  const title = await page.locator(".jdv-container h2").textContent();
  expect(title).toContain("JSON Diff Viewer");

  await page.locator("#jdv-left").fill('{"name":"Alice","age":30}');
  await page.locator("#jdv-right").fill('{"name":"Alice","age":31}');
  await page.locator("#jdv-compare").click();

  await expect(page.locator("#jdv-summary")).toContainText("1 changed");
  await expect(page.locator("#jdv-output-b")).toContainText("31");

  await page.locator("#jdv-clear").click();
  await expect(page.locator("#jdv-left")).toHaveValue("");
  await expect(page.locator("#jdv-right")).toHaveValue("");

  console.log("✅ JSON Diff Viewer works correctly");
});
