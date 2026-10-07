// Copies src/ to dist/ and renders the OG image if a browser is available.
// No bundler: the site is hand-written HTML/CSS with no runtime dependencies.
import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(root, "src");
const dist = resolve(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
cpSync(src, dist, { recursive: true });
if (!existsSync(resolve(dist, "CNAME"))) throw new Error("CNAME missing from dist");
console.log("built dist/");
