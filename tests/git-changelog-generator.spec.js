import { test, expect } from '@playwright/test';

test('Changelog Generator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/git-changelog-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Changelog');

  const textarea = await page.locator('#git-log-input');
  await expect(textarea).toBeAttached();

  const generateBtn = await page.locator('#generate-btn');
  await expect(generateBtn).toBeAttached();

  const copyBtn = await page.locator('#copy-btn');
  await expect(copyBtn).toBeAttached();

  const downloadBtn = await page.locator('#download-btn');
  await expect(downloadBtn).toBeAttached();

  const output = await page.locator('#output');
  await expect(output).toBeAttached();

  console.log('✅ Changelog Generator tool loads correctly');
});

test('Changelog Generator has output format options', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/git-changelog-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const formatSelect = page.locator('#output-format');
  await expect(formatSelect).toBeAttached();

  const options = await formatSelect.locator('option').allTextContents();
  expect(options).toContain('Markdown');
  expect(options).toContain('JSON');
  expect(options).toContain('CSV');

  console.log('✅ Changelog Generator has format options');
});

test('Changelog Generator generates changelog from git log', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/git-changelog-generator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const gitLogInput = page.locator('#git-log-input');
  await gitLogInput.fill(`abc1234 feat(auth): add login
def5678 fix(api): handle null response
ghi9012 docs: update README`);

  const generateBtn = page.locator('#generate-btn');
  await generateBtn.click();

  await page.waitForTimeout(500);

  const output = await page.locator('#output').inputValue();
  expect(output).toContain('# Changelog');
  expect(output).toContain('## ✨ Features');
  expect(output).toContain('## 🐛 Bug Fixes');
  expect(output).toContain('## 📚 Documentation');
  expect(output).toContain('abc1234');
  expect(output).toContain('add login');

  console.log('✅ Changelog Generator generates changelog correctly');
});