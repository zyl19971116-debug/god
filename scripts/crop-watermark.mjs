/**
 * One-off asset pipeline: crops the generator watermark strip from the raw
 * deity portraits and copies them into public/.
 *
 * Usage: node scripts/crop-watermark.mjs
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const RAW = join(ROOT, "raw", "nyx");
const RAW_HERO = join(ROOT, "raw", "hero");
const OUT_GODS = join(ROOT, "public", "gods");
const OUT_BG = join(ROOT, "public", "backgrounds");

const MAP = {
  Goddess_of_Love_and_Harmony: "elysia",
  God_of_Chaos_and_Destruction: "kronos",
  Goddess_of_Knowledge: "nexora",
  Goddess_of_Nature: "terra",
  God_of_Order: "valtor",
  Goddess_of_Storms: "zephyra",
  God_of_Fate_and_Doom: "moros",
  Goddess_of_the_Sun: "solara",
  Goddess_of_the_Void_and_Night: "nyx",
  God_of_the_Machine: "aether",
  Goddess_of_Abundance_and_Greed: "thalia",
  God_of_the_Stars: "orion",
};

const CROP_BOTTOM = 84;

function crop(src, dest, cropPx) {
  const png = PNG.sync.read(readFileSync(src));
  const { width, height } = png;
  const newHeight = height - cropPx;
  const out = new PNG({ width, height: newHeight });
  for (let y = 0; y < newHeight; y++) {
    const srcStart = (y * width) << 2;
    const dstStart = (y * width) << 2;
    png.data.copy(out.data, dstStart, srcStart, srcStart + (width << 2));
  }
  writeFileSync(dest, PNG.sync.write(out));
  return `${width}x${newHeight}`;
}

if (!existsSync(OUT_GODS)) mkdirSync(OUT_GODS, { recursive: true });
if (!existsSync(OUT_BG)) mkdirSync(OUT_BG, { recursive: true });

const report = [];
for (const [prefix, slug] of Object.entries(MAP)) {
  const file = readdirSync(RAW).find((f) => f.startsWith(prefix) && f.endsWith(".png"));
  if (!file) {
    report.push(`MISSING ${slug}`);
    continue;
  }
  const size = crop(join(RAW, file), join(OUT_GODS, `${slug}.png`), CROP_BOTTOM);
  report.push(`ok ${slug} ${size}`);
}

const heroFile = readdirSync(RAW_HERO).find((f) => f.endsWith(".png"));
if (heroFile) {
  const size = crop(join(RAW_HERO, heroFile), join(OUT_BG, "hero-deity.png"), 96);
  report.push(`ok hero ${size}`);
}

console.log(report.join("\n"));
