import { test, expect } from "@playwright/test";

test("SQL to JSON tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/sql-to-json");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("SQL");

  const textarea = await page.locator("#sql-input");
  await expect(textarea).toBeAttached();

  const parseBtn = await page.locator("#parse-btn");
  await expect(parseBtn).toBeAttached();

  const copyJsonBtn = await page.locator("#copy-json-btn");
  await expect(copyJsonBtn).toBeAttached();

  const copySchemaBtn = await page.locator("#copy-schema-btn");
  await expect(copySchemaBtn).toBeAttached();

  const downloadJsonBtn = await page.locator("#download-json-btn");
  await expect(downloadJsonBtn).toBeAttached();

  const downloadSchemaBtn = await page.locator("#download-schema-btn");
  await expect(downloadSchemaBtn).toBeAttached();

  const jsonOutput = await page.locator("#json-output");
  await expect(jsonOutput).toBeAttached();

  const schemaOutput = await page.locator("#schema-output");
  await expect(schemaOutput).toBeAttached();

  console.log("✅ SQL to JSON tool loads correctly");
});

test("SQL to JSON has tabs for JSON, Schema, and Preview", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/sql-to-json");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const tabs = page.locator(".tab");
  await expect(tabs).toHaveCount(3);

  const jsonTab = page.locator(".tab", { hasText: "JSON Output" });
  await expect(jsonTab).toBeAttached();

  const schemaTab = page.locator(".tab", { hasText: "JSON Schema" });
  await expect(schemaTab).toBeAttached();

  const previewTab = page.locator(".tab", { hasText: "Data Preview" });
  await expect(previewTab).toBeAttached();

  console.log("✅ SQL to JSON has all tabs");
});

test("SQL to JSON parses CREATE TABLE statement", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/sql-to-json");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const sqlInput = page.locator("#sql-input");
  await sqlInput.fill("CREATE TABLE users (id INT, name VARCHAR(100), email VARCHAR(255));");

  const parseBtn = page.locator("#parse-btn");
  await parseBtn.click();

  await page.waitForTimeout(500);

  const jsonOutput = await page.locator("#json-output").inputValue();
  expect(jsonOutput).toContain("users");
  expect(jsonOutput).toContain("id");
  expect(jsonOutput).toContain("name");
  expect(jsonOutput).toContain("email");

  const schemaOutput = await page.locator("#schema-output").inputValue();
  expect(schemaOutput).toContain("users");
  expect(schemaOutput).toContain("object");
  expect(schemaOutput).toContain("integer");
  expect(schemaOutput).toContain("string");

  console.log("✅ SQL to JSON parses CREATE TABLE correctly");
});
