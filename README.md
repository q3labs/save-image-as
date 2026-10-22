# Q3 Save Image As – JPG, PNG, WebP

Right-click any image and save it converted to JPG, PNG or WebP. Real conversion, done locally in your browser.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-2563eb.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Why it exists

"Save Image as Type" was removed by Google in 2026. This is a small, privacy-first replacement: one job, no tracking, no accounts, no remote code, and the only network request is the one that fetches the image you right-clicked.

## Features

- **Right-click menu:** *Save image as…* with JPG, PNG and WebP, plus *Save as default format*.
- **Real conversion:** the image is decoded and re-encoded in your browser (not renamed). Transparent areas become white when you save as JPG.
- **Sources:** WebP, PNG, JPG, GIF (first frame), AVIF and SVG (rendered to a sharp bitmap of at least 1,024 px).
- **Clean file names:** the original name without query strings, with the new extension, or `image-YYYYMMDD-HHMMSS`.
- **Settings:** default format, JPG/WebP quality (50–100, default 92) and whether to show the save dialog. Stored with `storage.sync`.
- **Clear errors:** if a site blocks access to an image, you get a notification that says why.

## Supported browsers

Chrome, Edge and Opera (Manifest V3, one package) and Firefox 140 or newer (desktop; Android 142 or newer).

## Install

| Browser | Link |
|---|---|
| Chrome Web Store | Coming soon |
| Microsoft Edge Add-ons | Coming soon |
| Firefox Add-ons | Coming soon |
| Opera add-ons | Coming soon |

Until the store listings are live, build it from source (below).

## Privacy

- Images are converted on your device and never uploaded.
- No analytics, no tracking, no accounts, no remote code.
- The only network request is the one that downloads the image you right-clicked, from the site that shows it.
- Full policy: [PRIVACY.md](PRIVACY.md).

Permissions, one line each:

| Permission | Why |
|---|---|
| `contextMenus` | Adds the *Save image as…* entry to the right-click menu on images. |
| `downloads` | Saves the converted file, with the save dialog so you pick the folder. |
| `storage` | Remembers three settings: default format, quality, show-dialog. |
| `notifications` | Tells you when an image cannot be converted. |
| `host_permissions: <all_urls>` | Images live on any site, so the extension must fetch the one you right-click. There are no content scripts. |
| `offscreen` (Chrome, Edge, Opera) | Renders SVG images to a canvas, because a service worker cannot draw SVG. Not used in Firefox. |

## Build from source

Requires Node.js 22.2 or newer.

```
npm install
npm run build   # icons + dist/q3-image-saver-chrome.zip + dist/q3-image-saver-firefox.zip (and unpacked dist/chrome, dist/firefox)
npm test        # unit tests
npm run lint    # eslint
npm run lint:firefox   # build, then web-ext lint on dist/firefox
```

The Chrome zip is used for Chrome, Edge and Opera. It adds the `offscreen` permission and drops the Firefox-only keys. The Firefox zip drops `service_worker` and `offscreen`. `npm run store-assets` regenerates the store screenshots.

## Load it unpacked

Run `npm run build` first.

- **Chrome:** open `chrome://extensions`, turn on *Developer mode*, *Load unpacked*, choose `dist/chrome`.
- **Edge:** open `edge://extensions`, turn on *Developer mode*, *Load unpacked*, choose `dist/chrome`.
- **Opera:** open `opera://extensions`, turn on *Developer mode*, *Load unpacked*, choose `dist/chrome`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, *Load Temporary Add-on…*, choose `dist/firefox/manifest.json`. Temporary add-ons disappear on restart.

After changing code, rebuild and press the reload button on the extension card. The manual test plan is in [TESTING.md](TESTING.md).

## Project layout

| File | Purpose |
|---|---|
| `manifest.json` | Source manifest. The build gives each browser only the keys it understands. |
| `background.js` | Context menu, fetch, decode, encode, download. Runs as a service worker and as a Firefox event page. |
| `offscreen.html`, `offscreen.js` | Chrome, Edge and Opera only: renders SVG. |
| `popup.*`, `options.*`, `settings.js`, `styles.css` | Toolbar popup and options page. |
| `scripts/` | Icon, build and store-graphics scripts. |
| `test/` | Unit tests. |
| `STORE_LISTING.md` | Store listing text and permission justifications. |

## Links

- Website: https://q3labs.co/extensions/save-image-as
- More free tools: https://q3labs.co/tools
- Source: https://github.com/q3labs/save-image-as

## License

[MIT](LICENSE) © 2026 Q3 Labs
