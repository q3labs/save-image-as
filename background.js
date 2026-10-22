// Q3 Save Image As: right-click an image, save it converted to JPG, PNG or WebP.
// Runs as a service worker (Chrome, Edge, Opera) and as an event page (Firefox).
// Everything happens locally: the only network request is for the image you clicked.

const api = globalThis.browser ?? globalThis.chrome;

const FORMATS = {
  jpg: { mime: "image/jpeg", ext: "jpg", label: "JPG", lossy: true },
  png: { mime: "image/png", ext: "png", label: "PNG", lossy: false },
  webp: { mime: "image/webp", ext: "webp", label: "WebP", lossy: true },
};
const DEFAULTS = { defaultFormat: "jpg", quality: 92, showSaveDialog: true };

const MENU_PARENT = "q3-save-parent";
const MENU_DEFAULT = "q3-save-default";
const MAX_SIDE = 16384; // canvas limit in the major browsers
const SVG_MIN_SIDE = 1024; // vector images are rendered at least this large

class ConvertError extends Error {}

// ---------------------------------------------------------------- settings

async function getSettings() {
  const stored = await api.storage.sync.get(DEFAULTS);
  const format = FORMATS[stored.defaultFormat] ? stored.defaultFormat : DEFAULTS.defaultFormat;
  const quality = Math.min(100, Math.max(50, Number(stored.quality) || DEFAULTS.quality));
  return { defaultFormat: format, quality, showSaveDialog: stored.showSaveDialog !== false };
}

// ---------------------------------------------------------------- file names

function pad(n) {
  return String(n).padStart(2, "0");
}

function fallbackName(now = new Date()) {
  const d = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const t = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `image-${d}-${t}`;
}

/** Base name of the image URL without query, hash or extension, safe for a file name. */
function baseNameFromUrl(srcUrl, now = new Date()) {
  let name = "";
  try {
    const url = new URL(srcUrl);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "file:") {
      const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
      try {
        name = decodeURIComponent(last);
      } catch {
        name = last;
      }
    }
  } catch {
    name = "";
  }
  name = name.replace(/\.[A-Za-z0-9]{1,5}$/, "");
  name = [...name].filter((c) => c.charCodeAt(0) >= 32).join("");
  name = name.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").replace(/^[.\s]+|[.\s]+$/g, "");
  if (name.length > 120) name = name.slice(0, 120).trim();
  return name || fallbackName(now);
}

function fileNameFor(srcUrl, formatKey, now = new Date()) {
  return `${baseNameFromUrl(srcUrl, now)}.${FORMATS[formatKey].ext}`;
}

// ---------------------------------------------------------------- decoding

function looksLikeSvg(blob, srcUrl, head) {
  if (blob.type.includes("svg")) return true;
  if (/\.svg($|[?#])/i.test(srcUrl) || srcUrl.startsWith("data:image/svg")) return true;
  return /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)?<svg[\s>]/i.test(head);
}

async function fetchImage(srcUrl) {
  let response;
  try {
    response = await fetch(srcUrl, { credentials: "include" });
  } catch {
    throw new ConvertError(
      srcUrl.startsWith("blob:")
        ? "This image lives only inside the page (a blob: address), so the extension cannot read it."
        : "The site blocked access to this image, or you are offline. Protected images cannot be converted.",
    );
  }
  if (!response.ok) throw new ConvertError(`The site returned an error (${response.status}) for this image.`);
  return response.blob();
}

/** Reads an SVG's size from its width/height or viewBox; null when it has neither. */
function svgSize(text) {
  const tag = (text.match(/<svg\b[^>]*>/i) ?? [""])[0];
  const num = (name) => {
    const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*["']\\s*([0-9.]+)\\s*(px)?\\s*["']`, "i"));
    return m ? parseFloat(m[1]) : 0;
  };
  let w = num("width");
  let h = num("height");
  if (!(w > 0 && h > 0)) {
    const vb = tag.match(/viewBox\s*=\s*["']\s*[-0-9.]+[ ,]+[-0-9.]+[ ,]+([0-9.]+)[ ,]+([0-9.]+)\s*["']/i);
    if (vb) {
      w = parseFloat(vb[1]);
      h = parseFloat(vb[2]);
    }
  }
  if (!(w > 0 && h > 0)) return null;
  const scale = Math.max(1, SVG_MIN_SIDE / Math.max(w, h));
  return { width: Math.min(MAX_SIDE, Math.round(w * scale)), height: Math.min(MAX_SIDE, Math.round(h * scale)) };
}

/** Draws an SVG on a canvas using an <img>, which needs a DOM (Firefox page or Chrome offscreen document). */
function renderSvgWithDom(text, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      canvas.getContext("2d").drawImage(img, 0, 0, size.width, size.height);
      canvas.toBlob((png) => (png ? resolve(png) : reject(new Error("render"))), "image/png");
    };
    img.onerror = () => reject(new Error("render"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  });
}

async function renderSvgInOffscreen(text, size) {
  const offscreen = api.offscreen;
  if (!offscreen) throw new Error("no-offscreen");
  const existing = api.runtime.getContexts ? await api.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] }) : [];
  if (!existing.length) {
    await offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["BLOBS"],
      justification: "Render an SVG image to a bitmap so it can be converted to JPG, PNG or WebP.",
    });
  }
  try {
    const reply = await api.runtime.sendMessage({ target: "q3-offscreen", type: "render-svg", text, size });
    if (!reply || !reply.dataUrl) throw new Error("render");
    return await (await fetch(reply.dataUrl)).blob();
  } finally {
    offscreen.closeDocument().catch(() => {});
  }
}

async function decodeSvg(blob) {
  const text = await blob.text();
  const size = svgSize(text);
  if (!size) throw new ConvertError("This SVG has no width, height or viewBox, so it has no size to convert.");
  try {
    const png = typeof document !== "undefined" ? await renderSvgWithDom(text, size) : await renderSvgInOffscreen(text, size);
    return await createImageBitmap(png);
  } catch {
    throw new ConvertError("This browser could not render the SVG image.");
  }
}

async function decode(blob, srcUrl) {
  const head = blob.size < 4_000_000 ? await blob.slice(0, 600).text() : "";
  if (looksLikeSvg(blob, srcUrl, head)) return decodeSvg(blob);
  try {
    return await createImageBitmap(blob);
  } catch {
    throw new ConvertError("This image format could not be decoded by your browser.");
  }
}

// ---------------------------------------------------------------- encoding

async function encode(bitmap, formatKey, quality) {
  const { width, height } = bitmap;
  if (!width || !height || width > MAX_SIDE || height > MAX_SIDE) {
    throw new ConvertError("This image is too large to convert in the browser.");
  }
  const format = FORMATS[formatKey];
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (formatKey === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const blob = await canvas.convertToBlob(format.lossy ? { type: format.mime, quality: quality / 100 } : { type: format.mime });
  if (blob.type !== format.mime) {
    throw new ConvertError(`This browser cannot export ${format.label} images.`);
  }
  return blob;
}

async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${blob.type};base64,${btoa(binary)}`;
}

// ---------------------------------------------------------------- save

function notify(message) {
  api.notifications.create({
    type: "basic",
    iconUrl: api.runtime.getURL("icons/icon-128.png"),
    title: "Q3 Save Image As",
    message,
  });
}

async function saveImage(srcUrl, formatKey) {
  try {
    const settings = await getSettings();
    const blob = await fetchImage(srcUrl);
    const bitmap = await decode(blob, srcUrl);
    const out = await encode(bitmap, formatKey, settings.quality);
    await api.downloads.download({
      url: await blobToDataUrl(out),
      filename: fileNameFor(srcUrl, formatKey),
      saveAs: settings.showSaveDialog,
    });
  } catch (error) {
    const known = error instanceof ConvertError;
    if (!known && /cancel/i.test(String(error?.message))) return; // the user closed the save dialog
    notify(known ? error.message : "The image could not be saved. Try again, or open the image in its own tab first.");
  }
}

// ---------------------------------------------------------------- menus

async function buildMenus() {
  const { defaultFormat } = await getSettings();
  await api.contextMenus.removeAll();
  api.contextMenus.create({ id: MENU_PARENT, title: "Save image as…", contexts: ["image"] });
  for (const [key, format] of Object.entries(FORMATS)) {
    api.contextMenus.create({ id: `q3-save-${key}`, parentId: MENU_PARENT, title: format.label, contexts: ["image"] });
  }
  api.contextMenus.create({
    id: MENU_DEFAULT,
    parentId: MENU_PARENT,
    title: `Save as default format (${FORMATS[defaultFormat].label})`,
    contexts: ["image"],
  });
}

async function onMenuClick(info) {
  if (!info.srcUrl) return;
  if (info.menuItemId === MENU_DEFAULT) return saveImage(info.srcUrl, (await getSettings()).defaultFormat);
  const key = String(info.menuItemId).replace("q3-save-", "");
  if (FORMATS[key]) return saveImage(info.srcUrl, key);
}

if (api) {
  api.runtime.onInstalled.addListener(buildMenus);
  api.runtime.onStartup.addListener(buildMenus);
  api.contextMenus.onClicked.addListener(onMenuClick);
  api.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.defaultFormat && FORMATS[changes.defaultFormat.newValue]) {
      Promise.resolve(api.contextMenus.update(MENU_DEFAULT, { title: `Save as default format (${FORMATS[changes.defaultFormat.newValue].label})` })).catch(() => {});
    }
  });
}

if (typeof module !== "undefined") module.exports = { baseNameFromUrl, fileNameFor, fallbackName, svgSize, looksLikeSvg };
