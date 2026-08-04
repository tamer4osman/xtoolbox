import { test, expect } from "@playwright/test";

test("Chroma Key Composer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/chroma-key-composer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Chroma Key Composer");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("green or blue screen backgrounds");

  const modeSelect = await page.locator("#mode-select");
  await expect(modeSelect).toHaveValue("compose");

  const foregroundUpload = await page.locator("#foreground-upload-area .file-upload");
  await expect(foregroundUpload).toBeVisible();

  const backgroundUpload = await page.locator("#background-upload-area .file-upload");
  await expect(backgroundUpload).toBeVisible();

  const greenBtn = await page.locator('.color-btn[data-color="#00FF00"]');
  await expect(greenBtn).toHaveClass(/active/);

  const similarity = await page.locator("#similarity");
  await expect(similarity).toHaveAttribute("value", "0.30");

  const blend = await page.locator("#blend");
  await expect(blend).toHaveAttribute("value", "0.10");

  const offsetX = await page.locator("#offset-x");
  await expect(offsetX).toBeAttached();

  const actionBtn = await page.locator("#action-btn");
  await expect(actionBtn).toHaveText("Compose Video");

  console.log("✅ Chroma Key Composer tool loads correctly");
});

test("Chroma Key Composer switches to transparency mode", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/chroma-key-composer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  await page.selectOption("#mode-select", "transparent");

  const actionBtn = await page.locator("#action-btn");
  await expect(actionBtn).toHaveText("Remove Background");

  const backgroundColumn = await page.locator("#background-column");
  await expect(backgroundColumn).toBeHidden();

  console.log("✅ Transparency mode toggle works");
});
