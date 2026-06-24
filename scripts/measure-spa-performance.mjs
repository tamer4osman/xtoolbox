import { chromium } from 'playwright';
import { existsSync } from 'fs';
import { resolve } from 'path';

const BASE = 'http://localhost:3000';
const THRESHOLD_MS = parseInt(process.env.THRESHOLD_MS || '50', 10);
const ITERATIONS = parseInt(process.env.ITERATIONS || '2', 10);

// Try env var first, then common install paths
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PLAYWRIGHT_CHROMIUM_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/snap/bin/chromium',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (p && existsSync(p)) return p;
  }

  // Check Playwright's own installation
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const pwPath = resolve(home, 'AppData/Local/ms-playwright');
  const { readdirSync } = (() => { try { return { readdirSync: require('fs').readdirSync }; } catch { return { readdirSync: () => [] }; } })();
  try {
    const dirs = readdirSync(pwPath);
    for (const d of dirs) {
      if (d.startsWith('chromium-')) {
        const exe = resolve(pwPath, d, 'chrome-win64', 'chrome.exe');
        if (existsSync(exe)) return exe;
      }
      if (d.startsWith('chrome-')) {
        const exe = resolve(pwPath, d, 'win64', 'chrome-win64', 'chrome.exe');
        if (existsSync(exe)) return exe;
      }
    }
  } catch {}

  return null;
}

const ALL_ROUTES = [
  '#/',
  '#/tools/image',
  '#/tools/jpg-to-webp',
  '#/about',
  '#/privacy',
  '#/terms',
  '#/tools/developer',
  '#/tools/json-formatter',
];

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('Chrome/Edge not found. Set CHROME_PATH env var or run: npx playwright install chromium');
    process.exit(1);
  }

  console.log(`SPA Performance Check (threshold: ${THRESHOLD_MS}ms, ${ITERATIONS} warm iterations)\n`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  await page.goto(BASE + '/#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Instrument hashchange for SPA navigation timing
  await page.evaluate(() => {
    window.addEventListener('hashchange', () => {
      performance.mark('spa-start');
      requestAnimationFrame(() => {
        performance.mark('spa-end');
        performance.measure('spa-nav', 'spa-start', 'spa-end');
      });
    });
  });

  const results = {};

  // Cold load (warmup)
  for (const route of ALL_ROUTES) {
    await page.evaluate((hash) => { location.hash = hash; }, route);
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => performance.clearMeasures());

  // Warm iterations
  for (let iter = 1; iter <= ITERATIONS; iter++) {
    for (const route of ALL_ROUTES) {
      await page.evaluate((hash) => { location.hash = hash; }, route);
      await page.waitForTimeout(400);
    }

    const measures = await page.evaluate(() =>
      performance.getEntriesByType('measure')
        .filter(m => m.name === 'spa-nav')
        .map(m => m.duration)
    );

    const startIdx = Math.max(0, measures.length - ALL_ROUTES.length);
    const iterMeasures = measures.slice(startIdx);

    for (let i = 0; i < ALL_ROUTES.length; i++) {
      const route = ALL_ROUTES[i];
      const time = iterMeasures[i];
      if (!results[route]) results[route] = [];
      if (time !== undefined) results[route].push(time);
    }

    await page.evaluate(() => performance.clearMeasures());
  }

  await browser.close();

  let allPass = true;
  for (const route of ALL_ROUTES) {
    const times = results[route];
    if (!times || times.length === 0) {
      console.log(`⚠  no data  ${route}`);
      continue;
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const pass = max <= THRESHOLD_MS;
    if (!pass) allPass = false;
    console.log(`${pass ? '✅' : '❌'}  avg ${avg.toFixed(1).padStart(5)}ms  max ${max.toFixed(1).padStart(5)}ms  ${route}`);
  }

  if (allPass) {
    console.log(`\n✅ All ${ALL_ROUTES.length} routes pass (max ≤ ${THRESHOLD_MS}ms)`);
  } else {
    console.log(`\n❌ Some routes exceed ${THRESHOLD_MS}ms threshold`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
