import { test, expect } from "@playwright/test";

test("html-playground renders header and editor controls", async ({ page }) => {
  await page.goto("/#/tools/html-playground");
  await expect(page.locator("h1")).toContainText("HTML Playground");
  await expect(page.locator(".hp-tab")).toHaveCount(3);
  await expect(page.locator("#hp-frame")).toBeVisible();
  await expect(page.locator("#hp-share")).toBeVisible();
});

test("html-playground switches editor tabs and renders preview", async ({ page }) => {
  await page.goto("/#/tools/html-playground");
  await expect(page.locator("#hp-frame")).toBeVisible();

  await page.locator('.hp-tab[data-lang="css"]').click();
  await expect(page.locator('.hp-tab[data-lang="css"]')).toHaveClass(/active/);

  await page.locator('.hp-tab[data-lang="js"]').click();
  await expect(page.locator('.hp-tab[data-lang="js"]')).toHaveClass(/active/);

  await page.locator("#hp-console-toggle").click();
  await expect(page.locator("#hp-console")).toHaveClass(/visible/);
});