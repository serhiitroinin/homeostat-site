// Shared: launch the Chromium that Playwright has already cached, or one named in CHROME_PATH.
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export async function launch() {
  const candidates = [
    process.env.CHROME_PATH,
    join(homedir(), "Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  const executablePath = candidates.find((p) => existsSync(p));
  if (!executablePath) throw new Error("No Chromium found; set CHROME_PATH");
  return chromium.launch({ executablePath, headless: true });
}
