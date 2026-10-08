// Copies src/ to dist/ and checks that every local reference in the HTML and CSS resolves.
// src/og.png is committed; re-render it with `npm run og` (needs a local Chromium), not here.
// No bundler: the site is hand-written HTML/CSS with no runtime dependencies.
import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(root, "src");
const dist = resolve(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
cpSync(src, dist, { recursive: true });
if (!existsSync(resolve(dist, "CNAME"))) throw new Error("CNAME missing from dist");
execFileSync(process.execPath, [resolve(root, "scripts/check.mjs"), "dist"], { stdio: "inherit" });
console.log("built dist/");
