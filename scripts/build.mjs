// Builds dist/q3-image-saver-chrome.zip (Chrome, Edge, Opera) and dist/q3-image-saver-firefox.zip,
// plus the unpacked folders dist/chrome and dist/firefox for loading and for `web-ext lint`.
// Zips are written here with Node built-ins (no dependencies).
//
//   node scripts/build.mjs

import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { crc32, deflateRawSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const SHARED = ["background.js", "popup.html", "popup.js", "options.html", "options.js", "settings.js", "styles.css"];
const ICONS = readdirSync(join(ROOT, "icons")).filter((f) => f.endsWith(".png")).map((f) => `icons/${f}`);

const base = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));

// Each store gets only the keys it understands.
function chromeManifest() {
  const m = structuredClone(base);
  delete m.background.scripts;
  delete m.browser_specific_settings;
  return m;
}
function firefoxManifest() {
  const m = structuredClone(base);
  delete m.background.service_worker;
  m.permissions = m.permissions.filter((p) => p !== "offscreen"); // Chrome-only, used for SVG rendering
  return m;
}

const targets = {
  chrome: { manifest: chromeManifest(), files: [...SHARED, "offscreen.html", "offscreen.js", ...ICONS] },
  firefox: { manifest: firefoxManifest(), files: [...SHARED, ...ICONS] },
};

function dosTime(date) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function zip(entries) {
  const { time, day } = dosTime(new Date());
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const packed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data) >>> 0;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    locals.push(local, nameBytes, packed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);
    offset += 30 + nameBytes.length + packed.length;
  }
  const centralBytes = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBytes, end]);
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

for (const [name, { manifest, files }] of Object.entries(targets)) {
  const entries = [{ name: "manifest.json", data: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`) }];
  for (const file of files) entries.push({ name: file, data: readFileSync(join(ROOT, file)) });
  for (const { name: file, data } of entries) {
    const target = join(DIST, name, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
  }
  const out = join(DIST, `q3-image-saver-${name}.zip`);
  writeFileSync(out, zip(entries));
  console.log(`dist/q3-image-saver-${name}.zip (${entries.length} files)`);
}
