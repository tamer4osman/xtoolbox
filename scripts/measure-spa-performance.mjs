import { chromium } from 'playwright';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';

const BASE = 'http://localhost:3000';
const THRESHOLD_MS = parseInt(process.env.THRESHOLD_MS || '50', 10);
const ITERATIONS = parseInt(process.env.ITERATIONS || '2', 10);

function pwCacheDir() {
  const home = homedir();
  switch (platform()) {
    case 'darwin':  return join(home, 'Library', 'Caches', 'ms-playwright');
    case 'linux':   return join(home, '.cache', 'ms-playwright');
    default:        return join(home, 'AppData', 'Local', 'ms-playwright');
  }
}

function findChrome() {
  const envPath = process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_PATH;
  if (envPath && existsSync(envPath)) return envPath;

  const systemPaths = [
    join('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'),
    join('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'),
    join('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Microsoft\\Edge\\Application\\msedge.exe'),
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/snap/bin/chromium',
  ].filter(Boolean);

  for (const p of systemPaths) {
    if (p && existsSync(p)) return p;
  }

  // Search Playwright's browser cache
  const pwPath = pwCacheDir();
  try {
    const dirs = readdirSync(pwPath);
    for (const d of dirs) {
      if (!d.startsWith('chromium-') && !d.startsWith('chrome-')) continue;
      const candidates = [
        join(pwPath, d, 'chrome-win64', 'chrome.exe'),
        join(pwPath, d, 'chrome-linux', 'chrome'),
        join(pwPath, d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
      ];
      for (const exe of candidates) {
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
  '#/category/productivity',
  '#/category/developer',
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
    window.__spaDone = null;
    window.addEventListener('hashchange', () => {
      performance.mark('spa-start');
      window.__spaDone = new Promise((resolve) => {
        const check = () => {
          const main = document.querySelector('#main-content');
          if (main && main.children.length > 0) {
            performance.mark('spa-end');
            performance.measure('spa-nav', 'spa-start', 'spa-end');
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      });
    });
  });

  const results = {};

  // Cold load (warmup)
  for (const route of ALL_ROUTES) {
    await page.evaluate((hash) => { location.hash = hash; }, route);
    await page.waitForFunction(() => window.__spaDone, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => performance.clearMeasures());

  // Warm iterations
  for (let iter = 1; iter <= ITERATIONS; iter++) {
    for (const route of ALL_ROUTES) {
      await page.evaluate((hash) => { location.hash = hash; }, route);
      await page.waitForFunction(() => window.__spaDone, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(100);
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
    if (!times || times.length === 0 || times.length !== ITERATIONS) {
      console.log(`❌  no data (expected ${ITERATIONS} samples, got ${times ? times.length : 0})  ${route}`);
      allPass = false;
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
