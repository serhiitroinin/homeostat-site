// Cuts the focused crops used by the landing page out of src/app-shots/.
// Rerun after the app screenshots are recaptured: node scripts/crops.mjs
// Needs ImageMagick 7 (`magick`) on PATH. Rects are in 1x CSS pixels of the source screen;
// every crop is cut from the @2x capture, then written at each requested density.
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const shots = resolve(root, "src/app-shots");
const out = resolve(root, "src/img");
mkdirSync(out, { recursive: true });

const crops = [
  // Evidence drawer, "Where this number came from", desktop
  { name: "evidence", src: "explore", rect: [880, 20, 560, 780], scales: [1, 2] },
  // Evidence drawer, mobile: the value and its first provenance rows, readable at phone width
  { name: "evidence-m", src: "explore", rect: [895, 90, 355, 410], scales: [2] },
  // Settings > Engines card, desktop
  { name: "engines", src: "settings-engines", rect: [286, 76, 776, 282], scales: [1, 2] },
  // Engines, mobile: engine names, local/remote badges and toggles
  { name: "engines-m", src: "settings-engines", rect: [300, 84, 400, 264], scales: [2] },
  // Training map band, desktop
  { name: "training", src: "training", rect: [0, 96, 1440, 700], scales: [1, 2] },
];

for (const { name, src, rect, scales } of crops) {
  for (const theme of ["light", "dark"]) {
    const input = resolve(shots, `${src}-${theme}@2x.webp`);
    const [x, y, w, h] = rect.map((v) => v * 2);
    for (const s of scales) {
      const file = resolve(out, `${name}-${theme}${s === 1 ? "" : `@${s}x`}.webp`);
      const args = [input, "-crop", `${w}x${h}+${x}+${y}`, "+repage"];
      if (s !== 2) args.push("-resize", `${(s / 2) * 100}%`);
      args.push("-quality", "82", "-define", "webp:method=6", file);
      execFileSync("magick", args);
      console.log(`${file.replace(root + "/", "")}  ${Math.round(statSync(file).size / 1024)} KB`);
    }
  }
}
