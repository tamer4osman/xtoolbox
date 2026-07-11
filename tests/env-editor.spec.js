import { test, expect } from "@playwright/test";

test("env-editor loads and renders", async ({ page }) => {
  await page.goto("/#/tools/env-editor");
  await expect(page.locator("h1")).toContainText("Environment Variable");
  await expect(page.locator("#env-textarea")).toBeVisible();
  await expect(page.locator("#env-presets button").first()).toBeVisible();
});

test("env-editor: tab switching", async ({ page }) => {
  await page.goto("/#/tools/env-editor");
  await expect(page.locator("#env-active-label")).toContainText(".env");
  await page.locator(".env-tab", { hasText: ".env.example" }).click();
  await expect(page.locator("#env-active-label")).toContainText(".env.example");
});

test("env-editor: preset appends variables", async ({ page }) => {
  await page.goto("/#/tools/env-editor");
  await page.locator(".env-preset", { hasText: "PostgreSQL" }).click();
  const v = await page.locator("#env-textarea").inputValue();
  expect(v).toContain("POSTGRES_HOST=localhost");
  expect(v).toContain("POSTGRES_PASSWORD=");
});

test("env-editor: conversion to JSON", async ({ page }) => {
  await page.goto("/#/tools/env-editor");
  await page.locator("#env-textarea").fill("A=1\nB=hello");
  await page.locator("#env-conv-json").click();
  await expect(page.locator("#env-output")).toContainText('"A": "1"');
  await expect(page.locator("#env-output")).toContainText('"B": "hello"');
});

test("env-editor: download button produces .env file", async ({ page }) => {
  await page.goto("/#/tools/env-editor");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#env-download").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^\.env/);
});
