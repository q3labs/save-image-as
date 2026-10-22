// Draws the extension icons (16, 32, 48, 128 px) with Node built-ins only:
// a rounded square in #2563EB with a small image glyph and a down-arrow, written as PNG.
//
//   node scripts/make-icons.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { crc32, deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "icons");
const BRAND = [0x25, 0x63, 0xeb];
const WHITE = [255, 255, 255];
const SAMPLES = 4; // supersampling per axis, for smooth edges

// Shapes in unit coordinates (0..1). Each returns true when the point is inside.
const roundedRect = (x, y, x0, y0, x1, y1, r) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
};
const triangle = (x, y, [ax, ay], [bx, by], [cx, cy]) => {
  const d1 = (x - bx) * (ay - by) - (ax - bx) * (y - by);
  const d2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy);
  const d3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};

function glyph(x, y) {
  // Picture frame (outline) with a sun and two hills.
  const frame = roundedRect(x, y, 0.2, 0.15, 0.8, 0.5, 0.06) && !roundedRect(x, y, 0.26, 0.21, 0.74, 0.44, 0.03);
  const sun = (x - 0.38) ** 2 + (y - 0.29) ** 2 <= 0.045 ** 2;
  const hills = triangle(x, y, [0.3, 0.44], [0.46, 0.3], [0.62, 0.44]) || triangle(x, y, [0.5, 0.44], [0.62, 0.34], [0.74, 0.44]);
  // Down arrow.
  const stem = x >= 0.44 && x <= 0.56 && y >= 0.56 && y <= 0.74;
  const head = triangle(x, y, [0.3, 0.7], [0.7, 0.7], [0.5, 0.9]);
  return frame || sun || hills || stem || head;
}

function pixel(px, py, size) {
  let covered = 0;
  let glyphHits = 0;
  for (let sy = 0; sy < SAMPLES; sy++) {
    for (let sx = 0; sx < SAMPLES; sx++) {
      const x = (px + (sx + 0.5) / SAMPLES) / size;
      const y = (py + (sy + 0.5) / SAMPLES) / size;
      if (!roundedRect(x, y, 0, 0, 1, 1, 0.22)) continue;
      covered++;
      if (glyph(x, y)) glyphHits++;
    }
  }
  const total = SAMPLES * SAMPLES;
  if (!covered) return [0, 0, 0, 0];
  const mix = glyphHits / covered;
  return [...BRAND.map((c, i) => Math.round(c * (1 - mix) + WHITE[i] * mix)), Math.round((covered / total) * 255)];
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body) >>> 0, body.length + 4);
  return out;
}

function png(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0; // filter: none
    for (let x = 0; x < size; x++) Buffer.from(pixel(x, y, size)).copy(raw, row + 1 + x * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  writeFileSync(join(OUT, `icon-${size}.png`), png(size));
  console.log(`icons/icon-${size}.png`);
}

// Store listing logo: the same artwork at 300 x 300.
mkdirSync(join(ROOT, "store-assets"), { recursive: true });
writeFileSync(join(ROOT, "store-assets", "store-logo.png"), png(300));
console.log("store-assets/store-logo.png");
