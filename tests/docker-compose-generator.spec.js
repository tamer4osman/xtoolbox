import { test, expect } from '@playwright/test';

test('docker-compose-generator loads and renders', async ({ page }) => {
  await page.goto('/#/tools/docker-compose-generator');
  await expect(page.locator('h1')).toContainText('Docker Compose');
  await expect(page.locator('#dc-output')).toBeVisible();
  await expect(page.locator('#dc-palette button').first()).toBeVisible();
});

test('docker-compose-generator: add postgres, see named volume + env', async ({ page }) => {
  await page.goto('/#/tools/docker-compose-generator');
  await page.locator('#dc-palette button', { hasText: 'PostgreSQL' }).click();
  await expect(page.locator('.dc-card')).toHaveCount(1);
  await expect(page.locator('#dc-output')).toContainText('postgres:16-alpine');
  await expect(page.locator('#dc-output')).toContainText('pgdata:');
  await expect(page.locator('#dc-output')).toContainText('POSTGRES_PASSWORD');
});

test('docker-compose-generator: add redis + nginx, see both services', async ({ page }) => {
  await page.goto('/#/tools/docker-compose-generator');
  await page.locator('#dc-palette button', { hasText: 'Redis' }).click();
  await page.locator('#dc-palette button', { hasText: 'Nginx' }).click();
  await expect(page.locator('.dc-card')).toHaveCount(2);
  await expect(page.locator('#dc-output')).toContainText('cache:');
  await expect(page.locator('#dc-output')).toContainText('nginx:');
  await expect(page.locator('#dc-output')).toContainText('redis:7-alpine');
});

test('docker-compose-generator: download button is wired and produces blob', async ({ page }) => {
  await page.goto('/#/tools/docker-compose-generator');
  await page.locator('#dc-palette button', { hasText: 'Redis' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#dc-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('docker-compose.yml');
});
