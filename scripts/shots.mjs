// Full-page screenshots of the built site at 375, 768 and 1440 px, light and dark.
// Usage: node scripts/shots.mjs [baseUrl]   (default http://127.0.0.1:4321)
import { launch } from "./browser.mjs";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const base = process.argv[2] || "http://127.0.0.1:4321";
const out = resolve(import.meta.dirname, "..", "screenshots");
mkdirSync(out, { recursive: true });

const widths = [375, 768, 1440];
const pages = [["", "home"], ["/privacy/", "privacy"]];
const browser = await launch();
for (const scheme of ["light", "dark"]) {
  for (const w of widths) {
    for (const [path, name] of pages) {
      if (name === "privacy" && w !== 1440) continue;
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: "networkidle" });
      // scroll the page once so loading="lazy" images load before the full-page capture
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      const file = resolve(out, `${name}-${w}-${scheme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log("wrote", file);
      await ctx.close();
    }
  }
}
await browser.close();
