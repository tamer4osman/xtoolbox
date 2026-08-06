import { test, expect } from "@playwright/test";

const SCHEMA = JSON.stringify(
  {
    type: "object",
    properties: { name: { type: "string" }, age: { type: "integer" } },
    required: ["name"],
    additionalProperties: false
  },
  null,
  2
);

test("JSON Schema Validator loads and validates", async ({ page }) => {
  await page.goto("/#/tools/json-schema-validator");
  await expect(page.locator("h1")).toContainText("JSON Schema Validator");

  await page.locator("#schemaInput").fill(SCHEMA);
  await page.locator("#dataInput").fill('{"name": "Ada", "age": 36}');
  await page.locator("#validateBtn").click();

  await expect(page.locator("#schemaResult")).toContainText("Data is valid");
});

test("reports violations and invalid JSON", async ({ page }) => {
  await page.goto("/#/tools/json-schema-validator");
  await page.locator("#schemaInput").fill(SCHEMA);

  await page.locator("#dataInput").fill('{"age": 36}');
  await page.locator("#validateBtn").click();
  await expect(page.locator("#schemaResult")).toContainText("violates");

  await page.locator("#dataInput").fill("{bad json");
  await page.locator("#validateBtn").click();
  await expect(page.locator("#schemaResult")).toContainText("not valid JSON");
});
