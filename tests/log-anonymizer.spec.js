import { test, expect } from '@playwright/test';

test('Log Anonymizer tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/log-anonymizer');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Log');

  const textarea = await page.locator('#log-input');
  await expect(textarea).toBeAttached();

  const anonymizeBtn = await page.locator('#anonymize-btn');
  await expect(anonymizeBtn).toBeAttached();

  const copyBtn = await page.locator('#copy-btn');
  await expect(copyBtn).toBeAttached();

  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();

  const results = await page.locator('#log-output');
  await expect(results).toBeAttached();

  console.log('✅ Log Anonymizer tool loads correctly');
});

test('Log Anonymizer has checkbox options for data types', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/log-anonymizer');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const ipv4Checkbox = page.locator('#mask-ipv4');
  await expect(ipv4Checkbox).toBeAttached();

  const ipv6Checkbox = page.locator('#mask-ipv6');
  await expect(ipv6Checkbox).toBeAttached();

  const emailCheckbox = page.locator('#mask-email');
  await expect(emailCheckbox).toBeAttached();

  const apikeyCheckbox = page.locator('#mask-apikey');
  await expect(apikeyCheckbox).toBeAttached();

  const bearerCheckbox = page.locator('#mask-bearer');
  await expect(bearerCheckbox).toBeAttached();

  const dbCheckbox = page.locator('#mask-db');
  await expect(dbCheckbox).toBeAttached();

  const creditCheckbox = page.locator('#mask-credit');
  await expect(creditCheckbox).toBeAttached();

  const uuidCheckbox = page.locator('#mask-uuid');
  await expect(uuidCheckbox).toBeAttached();

  console.log('✅ Log Anonymizer has all checkbox options');
});

test('Log Anonymizer sanitizes log text', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/log-anonymizer');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const logInput = page.locator('#log-input');
  await logInput.fill('Request from 192.168.1.1 by user@example.com');

  const anonymizeBtn = page.locator('#anonymize-btn');
  await anonymizeBtn.click();

  await page.waitForTimeout(500);

  const output = await page.locator('#log-output').inputValue();
  expect(output).toContain('[IP_V4]');
  expect(output).toContain('[EMAIL]');
  expect(output).not.toContain('192.168.1.1');
  expect(output).not.toContain('user@example.com');

  console.log('✅ Log Anonymizer sanitizes log text correctly');
});