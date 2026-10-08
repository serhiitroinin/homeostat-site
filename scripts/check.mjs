// Verifies that every local path referenced from the site's HTML and CSS exists.
// Usage: node scripts/check.mjs [dir]   (default: src). Exits 1 on a missing file.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join, dirname, relative, extname } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dir = resolve(root, process.argv[2] || "src");

function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);
}

function refs(file, text) {
  const out = [];
  // Inline data: URIs can contain commas and nested url(); drop them before scanning.
  text = text.replace(/"data:[^"]*"|'data:[^']*'/g, '""');
  if (extname(file) === ".html") {
    for (const m of text.matchAll(/\s(?:src|href)="([^"]+)"/g)) out.push(m[1]);
    for (const m of text.matchAll(/\ssrcset="([^"]+)"/g))
      for (const part of m[1].split(",")) out.push(part.trim().split(/\s+/)[0]);
  }
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) out.push(m[1]);
  return out.filter((u) => u && !/^(?:[a-z]+:|#|\/\/)/i.test(u));
}

const missing = [];
let checked = 0;
for (const file of walk(dir).filter((f) => /\.(html|css)$/.test(f))) {
  for (const ref of refs(file, readFileSync(file, "utf8"))) {
    const path = decodeURIComponent(ref.split(/[?#]/)[0]);
    let target = path.startsWith("/") ? join(dir, path) : resolve(dirname(file), path);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
    checked++;
    if (!existsSync(target)) missing.push(`${relative(root, file)}: ${ref}`);
  }
}
if (missing.length) {
  console.error(`missing ${missing.length} of ${checked} references:\n  ` + missing.join("\n  "));
  process.exit(1);
}
console.log(`checked ${checked} local references in ${relative(root, dir)}/, all present`);
