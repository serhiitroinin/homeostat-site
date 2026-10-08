// Renders src/favicon.svg to the raster icons browsers and phones ask for:
// favicon.ico (16/32/48), apple-touch-icon.png (180) and the manifest's
// 192/512 PNGs. Needs rsvg-convert and ImageMagick (brew install librsvg imagemagick);
// the outputs are committed, so CI does not run this.
//
// Rasters use the light palette (an icon file has no prefers-color-scheme) and
// a full-bleed square: iOS and Android mask their own corners, and the gauge
// sits well inside the 80% safe zone a maskable icon needs.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const src = resolve(import.meta.dirname, "../src");
const svg = readFileSync(join(src, "favicon.svg"), "utf8");
const tmp = mkdtempSync(join(tmpdir(), "homeostat-icons-"));
const rounded = join(tmp, "rounded.svg");
const square = join(tmp, "square.svg");
writeFileSync(rounded, svg);
writeFileSync(square, svg.replace(/ rx="\d+"/, ""));

const png = (input, size, out) => execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", out, input]);

try {
  for (const size of [16, 32, 48]) png(rounded, size, join(tmp, `ico-${size}.png`));
  execFileSync("magick", [16, 32, 48].map((s) => join(tmp, `ico-${s}.png`)).concat(join(src, "favicon.ico")));
  png(square, 180, join(src, "apple-touch-icon.png"));
  png(square, 192, join(src, "icon-192.png"));
  png(square, 512, join(src, "icon-512.png"));
  console.log("wrote favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
