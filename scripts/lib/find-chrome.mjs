import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { homedir, platform } from "os";

function pwCacheDir() {
  const home = homedir();
  switch (platform()) {
    case "darwin":
      return join(home, "Library", "Caches", "ms-playwright");
    case "linux":
      return join(home, ".cache", "ms-playwright");
    default:
      return join(home, "AppData", "Local", "ms-playwright");
  }
}

export function findChrome() {
  const envPath = process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_PATH;
  if (envPath && existsSync(envPath)) return envPath;

  const systemPaths = [
    join("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"),
    join("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"),
    join("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"),
    process.env.LOCALAPPDATA &&
      join(process.env.LOCALAPPDATA, "Microsoft\\Edge\\Application\\msedge.exe"),
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/snap/bin/chromium"
  ].filter(Boolean);

  for (const p of systemPaths) {
    if (p && existsSync(p)) return p;
  }

  const pwPath = pwCacheDir();
  try {
    const dirs = readdirSync(pwPath);
    for (const d of dirs) {
      if (!d.startsWith("chromium-") && !d.startsWith("chrome-")) continue;
      const candidates = [
        join(pwPath, d, "chrome-win64", "chrome.exe"),
        join(pwPath, d, "chrome-linux", "chrome"),
        join(pwPath, d, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium")
      ];
      for (const exe of candidates) {
        if (existsSync(exe)) return exe;
      }
    }
  } catch {}
  return null;
}
