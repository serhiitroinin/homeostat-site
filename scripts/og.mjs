// Renders scripts/og.html to src/og.png (1200x630) with the self-hosted fonts.
import { launch } from "./browser.mjs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(root, "scripts/og.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: resolve(root, "src/og.png"), type: "png" });
await browser.close();
console.log("wrote src/og.png");
