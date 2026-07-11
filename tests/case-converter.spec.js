import { test, expect } from "@playwright/test";

test("Case Converter tool loads and works", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/case-converter");
  await page.waitForSelector(".tool-container", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Case Converter");

  const input = page.locator("#input");
  const output = page.locator("#output");

  await input.fill("HELLO WORLD");
  await page.locator("#lowerBtn").click();
  await expect(output).toHaveValue("hello world");

  await input.fill("hello world");
  await page.locator("#upperBtn").click();
  await expect(output).toHaveValue("HELLO WORLD");

  await input.fill("hello world");
  await page.locator("#titleBtn").click();
  await expect(output).toHaveValue("Hello World");

  await input.fill("hello. world!");
  await page.locator("#sentenceBtn").click();
  await expect(output).toHaveValue("Hello. World!");

  await input.fill("HeLlO");
  await page.locator("#toggleBtn").click();
  await expect(output).toHaveValue("hElLo");

  console.log("✅ Case Converter tool works correctly");
});
