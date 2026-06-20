import { test, expect } from '@playwright/test';

test('resume-builder loads and has form sections', async ({ page }) => {
  await page.goto('/#/tools/resume-builder');
  await expect(page.locator('h1')).toContainText('Resume Builder');
  await expect(page.locator('#rb-name')).toBeVisible();
  await expect(page.locator('#rb-template')).toBeVisible();
  await expect(page.locator('#rb-pdf-btn')).toBeVisible();
});

test('resume-builder live preview updates on input', async ({ page }) => {
  await page.goto('/#/tools/resume-builder');
  await page.fill('#rb-name', 'Jane Doe');
  await page.fill('#rb-title', 'Software Engineer');
  await expect(page.locator('.rb-p-name')).toContainText('Jane Doe');
  await expect(page.locator('.rb-p-title')).toContainText('Software Engineer');
});

test('resume-builder template switch works', async ({ page }) => {
  await page.goto('/#/tools/resume-builder');
  await page.fill('#rb-name', 'Test User');
  await page.selectOption('#rb-template', 'modern');
  await expect(page.locator('.rb-modern-layout')).toBeVisible();
  await page.selectOption('#rb-template', 'minimal');
  await expect(page.locator('.rb-minimal')).toBeVisible();
});

test('resume-builder add experience entry', async ({ page }) => {
  await page.goto('/#/tools/resume-builder');
  await page.click('#rb-add-experience');
  const entries = page.locator('.rb-entry');
  await expect(entries).toHaveCount(2);
});
