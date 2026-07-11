import { test, expect } from "@playwright/test";

test("XML Formatter & Validator tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/xml-formatter");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("XML Formatter & Validator");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("XML");

  const input = page.locator("#xf-input");
  await expect(input).toBeAttached();

  const formatBtn = page.locator("#xf-format");
  await expect(formatBtn).toBeAttached();

  const validateBtn = page.locator("#xf-validate");
  await expect(validateBtn).toBeAttached();

  const minifyBtn = page.locator("#xf-minify");
  await expect(minifyBtn).toBeAttached();

  const clearBtn = page.locator("#xf-clear");
  await expect(clearBtn).toBeAttached();

  const output = page.locator("#xf-output");
  await expect(output).toBeAttached();

  const copyBtn = page.locator("#xf-copy");
  await expect(copyBtn).toBeAttached();

  const downloadBtn = page.locator("#xf-download");
  await expect(downloadBtn).toBeAttached();

  const status = page.locator("#xf-status");
  await expect(status).toBeHidden();

  console.log("✅ XML Formatter & Validator tool loads correctly");
});

test("XML Formatter & Validator formats XML on button click", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/xml-formatter");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const input = page.locator("#xf-input");
  await input.fill("<root><name>John</name><age>30</age></root>");

  const formatBtn = page.locator("#xf-format");
  await formatBtn.click();

  await page.waitForTimeout(500);

  const status = page.locator("#xf-status");
  await expect(status).toBeVisible();
  await expect(status).toContainText("formatted successfully");

  const output = page.locator("#xf-output");
  const outputText = await output.textContent();
  expect(outputText).toContain("<root>");
  expect(outputText).toContain("<name>");

  console.log("✅ XML Formatter & Validator formats XML");
});

test("XML Formatter & Validator detects invalid XML", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/xml-formatter");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const input = page.locator("#xf-input");
  await input.fill("<root><name>John</root>");

  const validateBtn = page.locator("#xf-validate");
  await validateBtn.click();

  await page.waitForTimeout(500);

  const status = page.locator("#xf-status");
  await expect(status).toBeVisible();
  await expect(status).toContainText("Invalid");

  console.log("✅ XML Formatter & Validator detects invalid XML");
});
