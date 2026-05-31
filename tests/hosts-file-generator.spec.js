import { test, expect } from '@playwright/test';

test('Hosts File Configurator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/hosts-file-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Hosts File Configurator');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('hosts');

  const templateSelect = page.locator('#hfg-template');
  await expect(templateSelect).toBeAttached();

  const entriesDiv = page.locator('#hfg-entries');
  await expect(entriesDiv).toBeAttached();

  const addBtn = page.locator('#hfg-add');
  await expect(addBtn).toBeAttached();

  const output = page.locator('#hfg-output');
  await expect(output).toBeAttached();

  const copyBtn = page.locator('#hfg-copy');
  await expect(copyBtn).toBeAttached();

  const downloadBtn = page.locator('#hfg-download');
  await expect(downloadBtn).toBeAttached();

  console.log('✅ Hosts File Configurator tool loads correctly');
});

test('Hosts File Configurator adds entry on button click', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/hosts-file-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const addBtn = page.locator('#hfg-add');
  await addBtn.click();

  const rows = page.locator('.hfg-row');
  await expect(rows).toHaveCount(1);

  const ipInput = page.locator('.hfg-ip').first();
  await expect(ipInput).toBeAttached();

  console.log('✅ Hosts File Configurator adds entry');
});

test('Hosts File Configurator template loads entries', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/hosts-file-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const templateSelect = page.locator('#hfg-template');
  await templateSelect.selectOption('1'); // Localhost

  const rows = page.locator('.hfg-row');
  await expect(rows).toHaveCount(1);

  const ipInput = page.locator('.hfg-ip').first();
  const ipValue = await ipInput.inputValue();
  expect(ipValue).toBe('127.0.0.1');

  console.log('✅ Hosts File Configurator template works');
});