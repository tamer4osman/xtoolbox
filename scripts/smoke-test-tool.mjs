import { chromium } from "playwright";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { findChrome } from "./lib/find-chrome.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT || "15000", 10);

function loadToolMeta(toolId) {
  const toolsPath = resolve(ROOT, "src", "data", "tools.json");
  const tools = JSON.parse(readFileSync(toolsPath, "utf8"));
  return tools.find(t => t.id === toolId);
}

function checkDevServer() {
  try {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
    void pkg;
    return true;
  } catch {
    return false;
  }
}

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function pass(msg) {
  console.log(`  ${GREEN}✓${RESET} ${msg}`);
}
function fail(msg, detail) {
  console.log(`  ${RED}✗ ${msg}${RESET}`);
  if (detail) console.log(`${DIM}      ${detail}${RESET}`);
}

async function smokeTest(toolId) {
  const toolMeta = loadToolMeta(toolId);
  if (!toolMeta) {
    console.log(`${RED}✗ Tool "${toolId}" not found in src/data/tools.json${RESET}`);
    return false;
  }

  console.log(`\n${BOLD}Smoke test: ${toolMeta.name}${RESET} (${toolId})`);
  console.log(`${DIM}  category: ${toolMeta.category} | status: ${toolMeta.status}${RESET}\n`);

  const chromePath = findChrome();
  if (!chromePath) {
    console.log(`${RED}✗ Chrome/Edge not found. Set CHROME_PATH or run: npx playwright install chromium${RESET}`);
    return false;
  }

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  const networkFailures = [];
  const pageErrors = [];

  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
    else if (msg.type() === "warning") consoleWarnings.push(msg.text());
  });

  page.on("pageerror", err => {
    pageErrors.push(err.message);
  });

  page.on("response", response => {
    const status = response.status();
    if (status >= 400) {
      networkFailures.push({ url: response.url(), status });
    }
  });

  let allPassed = true;
  const failWith = (msg, detail) => {
    fail(msg, detail);
    allPassed = false;
  };

  try {
    const url = `${BASE}/#/tools/${toolId}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
    pass(`Navigated to ${url}`);

    await page.waitForFunction(
      () => {
        const c = document.querySelector("#tool-container");
        return c && c.children.length > 0;
      },
      { timeout: TIMEOUT_MS }
    );
    pass("#tool-container rendered with content");

    const headerText = await page.evaluate(() => {
      const h1 = document.querySelector(".tool-header h1");
      return h1 ? h1.textContent.trim() : null;
    });
    if (!headerText) {
      failWith("Tool header h1 not found", "Expected .tool-header h1 to exist");
    } else if (!headerText.includes(toolMeta.name)) {
      failWith(
        `Header h1 mismatch`,
        `Expected to contain "${toolMeta.name}", got "${headerText}"`
      );
    } else {
      pass(`Header h1 matches tool name ("${headerText}")`);
    }

    const primaryControl = await page.evaluate(() => {
      const container = document.querySelector("#tool-container");
      if (!container) return null;
      return !!(
        container.querySelector('input[type="file"]') ||
        container.querySelector("button") ||
        container.querySelector("textarea") ||
        container.querySelector("select") ||
        container.querySelector('input[type="text"]') ||
        container.querySelector('input[type="number"]') ||
        container.querySelector('input[type="range"]') ||
        container.querySelector('input[type="search"]')
      );
    });
    if (primaryControl) {
      pass("Primary interactive control found (input/button/textarea/select)");
    } else {
      failWith("No primary interactive control found", "Expected at least one button, input, textarea, or select inside #tool-container");
    }

    const hasErrorState = await page.evaluate(() => {
      const container = document.querySelector("#tool-container");
      if (!container) return false;
      return !!container.querySelector(".error-state, .error-page");
    });
    if (hasErrorState) {
      const errorText = await page.evaluate(() => {
        const el = document.querySelector("#tool-container .error-state, #tool-container .error-page");
        return el ? el.textContent.trim().slice(0, 200) : "";
      });
      failWith("Tool rendered an error state", errorText);
    } else {
      pass("No error-state UI rendered");
    }

    await page.waitForTimeout(800);

    const relevantErrors = consoleErrors.filter(text => {
      if (text.includes("third-party") || text.includes("ad")) return false;
      if (text.includes("favicon.ico")) return false;
      if (text.includes("DevTools failed to load")) return false;
      return true;
    });
    if (relevantErrors.length === 0) {
      pass("0 console errors");
    } else {
      failWith(`${relevantErrors.length} console error(s)`, relevantErrors.slice(0, 3).join("\n      "));
    }

    const relevantPageErrors = pageErrors.filter(text => {
      if (text.includes("favicon.ico")) return false;
      return true;
    });
    if (relevantPageErrors.length === 0) {
      pass("0 uncaught page errors");
    } else {
      failWith(`${relevantPageErrors.length} uncaught page error(s)`, relevantPageErrors.slice(0, 3).join("\n      "));
    }

    const relevantNetFailures = networkFailures.filter(f => {
      if (f.url.includes("favicon.ico")) return false;
      if (f.url.includes("ad") || f.url.includes("doubleclick") || f.url.includes("googlesyndication")) return false;
      return true;
    });
    if (relevantNetFailures.length === 0) {
      pass("0 failed network requests (4xx/5xx)");
    } else {
      const detail = relevantNetFailures
        .slice(0, 5)
        .map(f => `${f.status} ${f.url}`)
        .join("\n      ");
      failWith(`${relevantNetFailures.length} failed network request(s)`, detail);
    }

    if (consoleWarnings.length > 0) {
      console.log(`  ${YELLOW}!${RESET} ${consoleWarnings.length} console warning(s) (acceptable, review for new issues)`);
    }

  } catch (err) {
    failWith(`Smoke test threw: ${err.message}`, err.stack?.split("\n").slice(0, 3).join("\n      "));
  } finally {
    await browser.close();
  }

  console.log("");
  if (allPassed) {
    console.log(`${GREEN}✅ ${toolMeta.name} — smoke test passed${RESET}`);
  } else {
    console.log(`${RED}❌ ${toolMeta.name} — smoke test FAILED${RESET}`);
  }
  return allPassed;
}

async function main() {
  const toolId = process.argv[2];
  if (!toolId) {
    console.log(`${RED}Usage: node scripts/smoke-test-tool.mjs <tool-id>${RESET}`);
    console.log(`${DIM}  e.g. node scripts/smoke-test-tool.mjs chmod-calculator${RESET}`);
    console.log(`${DIM}  Set SMOKE_BASE_URL to override http://localhost:3000${RESET}`);
    process.exit(2);
  }

  if (!checkDevServer()) {
    console.log(`${RED}✗ Could not read package.json from project root${RESET}`);
    process.exit(1);
  }

  let ok;
  try {
    ok = await smokeTest(toolId);
  } catch (err) {
    console.error(`${RED}Fatal: ${err.message}${RESET}`);
    process.exit(1);
  }
  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error(`${RED}Fatal: ${err.message}${RESET}`);
  process.exit(1);
});
