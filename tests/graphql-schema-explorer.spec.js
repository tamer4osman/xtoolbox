import { test, expect } from "@playwright/test";

test("GraphQL Schema Explorer loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/graphql-schema-explorer");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("GraphQL");

  const uploadArea = page.locator("#upload-area");
  await expect(uploadArea).toBeVisible();

  const sdlInput = page.locator("#sdl-input");
  await expect(sdlInput).toBeVisible();

  const parsePasteBtn = page.locator("#parse-paste-btn");
  await expect(parsePasteBtn).toBeVisible();
  await expect(parsePasteBtn).toHaveText("Parse");

  console.log("✅ GraphQL Schema Explorer tool loads correctly");
});
