// Renders the store graphics (screenshots, promo tiles) from HTML mockups with Playwright.
// Screenshot 4 uses the real popup.html and options.html from dist/chrome.
//
//   npm run build && node scripts/store-assets.mjs
//
// Uses the installed Google Chrome (channel "chrome"). Output: store-assets/*.png

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "store-assets");
const DIST = join(ROOT, "dist", "chrome");
mkdirSync(OUT, { recursive: true });

const dataUrl = (file, mime = "image/png") => `data:${mime};base64,${readFileSync(file).toString("base64")}`;
const ICON = dataUrl(join(ROOT, "icons", "icon-128.png"));

const CSS = `
  :root { --brand:#2563eb; --deep:#1e3a8a; --ink:#0f172a; --muted:#475569; --soft:#eff6ff; --line:#dbe3ef; }
  * { box-sizing:border-box; margin:0; }
  body { font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; color:var(--ink); overflow:hidden; }
  .bg { background: radial-gradient(1100px 600px at 85% -10%, #3b82f6 0%, transparent 60%), linear-gradient(135deg,#1d4ed8,#1e3a8a); color:#fff; }
  .light { background: linear-gradient(180deg,#f8fbff,#e8f0fe); }
  .chip { display:inline-block; padding:8px 18px; border-radius:999px; font-weight:700; font-size:22px; background:#fff; color:var(--brand); }
  .chip.o { background:rgba(255,255,255,.16); color:#fff; border:2px solid rgba(255,255,255,.5); }
  .photo { position:relative; overflow:hidden; border-radius:16px; background:linear-gradient(180deg,#7dd3fc 0%,#bae6fd 55%,#fde68a 100%); }
  .photo::before { content:""; position:absolute; width:22%; aspect-ratio:1; border-radius:50%; background:#fbbf24; right:14%; top:12%; box-shadow:0 0 0 14px rgba(251,191,36,.25); }
  .photo::after { content:""; position:absolute; left:-10%; right:-10%; bottom:-30%; height:75%; background:#22c55e; border-radius:50% 50% 0 0 / 70% 70% 0 0; box-shadow: 0 -60px 0 -20px #16a34a; }
  .card { background:#fff; border-radius:20px; box-shadow:0 20px 50px rgba(15,23,42,.25); }
  h1,h2 { letter-spacing:-.02em; line-height:1.05; }
`;

const page = (w, h, body, cls = "bg") =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${CSS} body{width:${w}px;height:${h}px;}</style></head><body class="${cls}">${body}</body></html>`;

const arrowSvg = `<svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34" fill="#fff"/><path d="M22 36h24m-9-10 10 10-10 10" stroke="#2563eb" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const browserFrame = (inner, w, h) => `
  <div class="card" style="width:${w}px;height:${h}px;overflow:hidden;position:relative;background:#fff">
    <div style="height:46px;background:#e2e8f0;display:flex;align-items:center;gap:8px;padding:0 16px">
      <i style="width:12px;height:12px;border-radius:50%;background:#f87171"></i><i style="width:12px;height:12px;border-radius:50%;background:#fbbf24"></i><i style="width:12px;height:12px;border-radius:50%;background:#4ade80"></i>
      <div style="margin-left:14px;flex:1;height:28px;border-radius:14px;background:#fff;color:#64748b;font-size:15px;display:flex;align-items:center;padding:0 14px">example.com/gallery</div>
    </div>${inner}
  </div>`;

function screens(popupPng, optionsPng) {
  const s1 = page(1280, 800, `
    <div style="display:flex;height:100%;align-items:center;padding:0 90px;gap:60px">
      <div style="flex:1">
        <img src="${ICON}" width="88" height="88" style="border-radius:20px;margin-bottom:34px">
        <h1 style="font-size:78px;font-weight:800">Save any image as JPG, PNG or WebP</h1>
        <p style="font-size:38px;margin-top:22px;opacity:.92;font-weight:600">Right-click, done.</p>
        <div style="margin-top:38px;display:flex;gap:14px"><span class="chip">JPG</span><span class="chip">PNG</span><span class="chip">WebP</span></div>
      </div>
      <div style="width:430px;position:relative">
        <div class="photo" style="width:430px;height:330px;box-shadow:0 30px 60px rgba(0,0,0,.35)"></div>
        <div style="position:absolute;right:-26px;bottom:-34px;display:flex;gap:10px"><span class="chip" style="box-shadow:0 8px 24px rgba(0,0,0,.3)">.jpg</span><span class="chip o" style="background:#1e40af">.png</span></div>
      </div>
    </div>`);

  const s2 = page(1280, 800, `
    <div style="padding:34px 60px 0"><h2 style="font-size:46px;font-weight:800;color:var(--deep);margin-bottom:22px">Right-click any image, pick a format</h2>
    ${browserFrame(`
      <div style="padding:34px;display:flex;gap:30px;position:relative;height:560px">
        <div class="photo" style="width:520px;height:390px"></div>
        <div style="flex:1;color:#64748b;font-size:20px;line-height:1.5"><div style="height:18px;width:70%;background:#e2e8f0;border-radius:9px;margin-bottom:14px"></div><div style="height:14px;width:95%;background:#eef2f7;border-radius:7px;margin-bottom:10px"></div><div style="height:14px;width:88%;background:#eef2f7;border-radius:7px;margin-bottom:10px"></div><div style="height:14px;width:60%;background:#eef2f7;border-radius:7px"></div></div>
        <div style="position:absolute;left:300px;top:250px;width:290px;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 18px 40px rgba(15,23,42,.28);padding:8px;font-size:19px;color:#1e293b">
          <div style="padding:9px 14px">Open image in new tab</div><div style="padding:9px 14px">Copy image</div>
          <div style="padding:9px 14px;background:var(--brand);color:#fff;border-radius:8px;display:flex;justify-content:space-between;font-weight:700"><span>Save image as…</span><span>›</span></div>
          <div style="padding:9px 14px">Search image</div>
        </div>
        <div style="position:absolute;left:600px;top:290px;width:340px;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 18px 40px rgba(15,23,42,.28);padding:8px;font-size:20px;color:#1e293b">
          <div style="padding:10px 14px;font-weight:700">JPG</div><div style="padding:10px 14px;font-weight:700">PNG</div><div style="padding:10px 14px;font-weight:700">WebP</div>
          <div style="border-top:1px solid var(--line);margin:4px 0"></div><div style="padding:10px 14px;font-size:17px;color:#475569">Save as default format (JPG)</div>
        </div>
      </div>`, 1160, 620)}</div>`, "light");

  const s3 = page(1280, 800, `
    <div style="text-align:center;padding-top:62px"><h2 style="font-size:66px;font-weight:800">WebP to JPG in one click</h2>
    <p style="font-size:28px;margin-top:14px;opacity:.9">A real conversion, not a renamed file.</p></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:50px;margin-top:62px">
      <div class="card" style="width:420px;padding:20px;text-align:center"><div class="photo" style="height:280px"></div><p style="font-size:28px;font-weight:800;color:var(--ink);margin-top:16px">photo.webp</p><p style="font-size:19px;color:var(--muted)">Not accepted everywhere</p></div>
      ${arrowSvg}
      <div class="card" style="width:420px;padding:20px;text-align:center"><div class="photo" style="height:280px"></div><p style="font-size:28px;font-weight:800;color:var(--ink);margin-top:16px">photo.jpg</p><p style="font-size:19px;color:var(--muted)">Opens everywhere</p></div>
    </div>`);

  const s4 = page(1280, 800, `
    <div style="text-align:center;padding-top:44px"><h2 style="font-size:50px;font-weight:800;color:var(--deep)">Pick a default format and quality</h2>
    <p style="font-size:24px;margin-top:10px;color:var(--muted)">Change it in the toolbar popup or on the options page.</p></div>
    <div style="display:flex;align-items:flex-start;justify-content:center;gap:44px;margin-top:40px">
      <div class="card" style="padding:0;overflow:hidden;border:1px solid var(--line)"><img src="${popupPng}" style="display:block;width:330px"></div>
      <div class="card" style="padding:0;overflow:hidden;border:1px solid var(--line)"><img src="${optionsPng}" style="display:block;width:640px"></div>
    </div>`, "light");

  const lock = `<svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="58" fill="#fff"/><rect x="34" y="54" width="52" height="40" rx="8" fill="#2563eb"/><path d="M44 54V44a16 16 0 0 1 32 0v10" stroke="#2563eb" stroke-width="9" fill="none"/><circle cx="60" cy="72" r="6" fill="#fff"/></svg>`;
  const s5 = page(1280, 800, `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:80px">${lock}
      <h2 style="font-size:84px;font-weight:800;margin-top:30px">100% local.</h2>
      <p style="font-size:44px;font-weight:600;margin-top:16px;opacity:.95">No tracking. No servers. Open source.</p>
      <p style="font-size:26px;margin-top:34px;max-width:860px;opacity:.85;line-height:1.4">Images are converted on your device and never uploaded. No analytics, no accounts, no remote code.</p>
    </div>`);
  return [s1, s2, s3, s4, s5];
}

const tile = page(440, 280, `
  <div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding:0 30px">
    <img src="${ICON}" width="56" height="56" style="border-radius:13px;margin-bottom:14px">
    <h1 style="font-size:36px;font-weight:800">Save Image As<br>JPG, PNG, WebP</h1>
    <p style="font-size:17px;margin-top:10px;opacity:.9">Right-click, done. 100% local.</p>
  </div>`);

const marquee = page(1400, 560, `
  <div style="display:flex;align-items:center;height:100%;padding:0 90px;gap:60px">
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:20px"><img src="${ICON}" width="84" height="84" style="border-radius:20px"><span style="font-size:30px;font-weight:700;opacity:.92">Q3 Save Image As</span></div>
      <h1 style="font-size:72px;font-weight:800;margin-top:22px">Save any image as<br>JPG, PNG or WebP</h1>
      <p style="font-size:28px;margin-top:18px;opacity:.92">Right-click, done. Converted locally, nothing uploaded.</p>
    </div>
    <div style="position:relative;width:430px"><div class="photo" style="width:430px;height:320px;box-shadow:0 30px 60px rgba(0,0,0,.35)"></div>
      <div style="position:absolute;left:-30px;bottom:-26px;display:flex;gap:10px"><span class="chip">JPG</span><span class="chip">PNG</span><span class="chip">WebP</span></div></div>
  </div>`);

const browser = await chromium.launch({ channel: "chrome" });

async function shot(html, w, h, file, scale = 1) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: join(OUT, file), clip: { x: 0, y: 0, width: w, height: h } });
  await ctx.close();
}

// The real popup and options pages, with the extension storage API stubbed.
async function realPage(file, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    const data = { defaultFormat: "webp", quality: 85, showSaveDialog: true };
    window.chrome = { storage: { sync: { get: async () => ({ ...data }), set: async () => {} } } };
  });
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(join(DIST, file)).href);
  await p.waitForTimeout(300);
  const height = await p.evaluate(() => Math.ceil(document.querySelector("main").getBoundingClientRect().height));
  const png = await p.screenshot({ clip: { x: 0, y: 0, width: w, height } });
  await ctx.close();
  return `data:image/png;base64,${png.toString("base64")}`;
}

const popupPng = await realPage("popup.html", 300, 600);
const optionsPng = await realPage("options.html", 560, 700);

const list = screens(popupPng, optionsPng);
for (const [i, html] of list.entries()) {
  await shot(html, 1280, 800, `screenshot-${i + 1}-1280x800.png`);
  await shot(html, 1280, 800, `screenshot-${i + 1}-640x400.png`, 0.5);
}
await shot(tile, 440, 280, "small-promo-tile.png");
await shot(marquee, 1400, 560, "marquee-promo.png");

// Optimised WebP copies of the 1280x800 screenshots for the website (store-assets/web/).
mkdirSync(join(OUT, "web"), { recursive: true });
const conv = await (await browser.newContext()).newPage();
for (let i = 1; i <= 5; i++) {
  const src = dataUrl(join(OUT, `screenshot-${i}-1280x800.png`));
  const b64 = await conv.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, "image/webp", 0.86));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = "";
    for (let j = 0; j < buf.length; j += 0x8000) bin += String.fromCharCode(...buf.subarray(j, j + 0x8000));
    return btoa(bin);
  }, src);
  writeFileSync(join(OUT, "web", `screenshot-${i}.webp`), Buffer.from(b64, "base64"));
}
await browser.close();
console.log("store-assets written");
