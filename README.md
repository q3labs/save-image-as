# Q3 Save Image As – JPG, PNG, WebP

Right-click any image, save it converted to JPG, PNG or WebP. Manifest V3, one codebase for Chrome, Edge, Opera and Firefox. No libraries, no content scripts, no network requests except fetching the image you clicked.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Source manifest (has both `service_worker` and `scripts`). The build strips what each browser doesn't need. |
| `background.js` | Context menu, fetch, decode (`createImageBitmap`), encode (`OffscreenCanvas`), download. Works as a service worker and as a Firefox event page. |
| `offscreen.html/js` | Chrome/Edge/Opera only: renders SVG images (a service worker has no DOM). |
| `popup.*`, `options.*`, `settings.js`, `styles.css` | Toolbar popup and options page (settings in `storage.sync`). |
| `scripts/make-icons.mjs` | Draws `icons/*.png` with Node built-ins. |
| `scripts/build.mjs` | Builds `dist/`. |
| `test/` | Unit tests for file names and SVG sizing. |
| `PRIVACY.md`, `STORE_LISTING.md` | Policy and store text. |

## Build and check

```
npm run build        # icons + dist/q3-image-saver-chrome.zip + dist/q3-image-saver-firefox.zip (and unpacked dist/chrome, dist/firefox)
npm test             # unit tests
npm run lint         # eslint
npm run lint:firefox # build, then web-ext lint on dist/firefox
```

The Chrome zip is used for Chrome, Edge and Opera. It adds the `offscreen` permission (SVG rendering) and drops the Firefox-only keys. The Firefox zip drops `service_worker` and `offscreen`.

## Load it for testing

Run `npm run build` first.

- **Chrome**: open `chrome://extensions`, turn on *Developer mode*, *Load unpacked*, choose `dist/chrome`.
- **Edge**: open `edge://extensions`, turn on *Developer mode*, *Load unpacked*, choose `dist/chrome`.
- **Opera**: open `opera://extensions`, turn on *Developer mode*, *Load unpacked*, choose `dist/chrome`.
- **Firefox** (128+): open `about:debugging#/runtime/this-firefox`, *Load Temporary Add-on…*, choose `dist/firefox/manifest.json`. Temporary add-ons disappear on restart.

Right-click an image and pick *Save image as…*. After changing code, rebuild and press the reload button on the extension card.

## Test plan

Use a test page with the images below (or any site). For each, right-click → *Save image as…* → the format, and open the saved file.

| # | Image | Do | Expect |
|---|---|---|---|
| 1 | A WebP image (many news sites, or `https://www.gstatic.com/webp/gallery/1.webp`) | Save as JPG, then as PNG | The saved file really is a JPEG/PNG (check the file type, not just the name) and opens in an image editor. |
| 2 | A PNG with transparency (any logo on a transparent background) | Save as JPG | Transparent areas are **white**, not black. Save as PNG keeps transparency. Save as WebP keeps transparency. |
| 3 | An SVG (for example a logo `.svg` opened in its own tab) | Save as PNG and JPG | A sharp bitmap at least 1024 px on its longest side. An SVG with no width/height/viewBox gives a notification, not a crash. |
| 4 | An animated GIF | Save as PNG | The first frame only. |
| 5 | A cross-origin CDN image (a page on one site showing an image from another domain) | Save as JPG | Works, even though the page and the image are on different domains. |
| 6 | A blocked or protected image (a hot-link-protected image, a `blob:` image from a web app, an image behind a login you are not signed in to) | Save as JPG | A notification explaining why it failed; no file is created. |
| 7 | Any image | Choose *Save as default format*, then change the default in the popup | The menu title shows the new default (for example "Save as default format (WebP)"); the saved format matches. |
| 8 | Any image, with *Show the save dialog* turned off in options | Save | The file goes straight to the Downloads folder. |
| 9 | An image whose URL has `%20`, a query string and a hash | Save | The file name is the decoded name with the new extension; an image with no usable name is saved as `image-YYYYMMDD-HHMMSS.ext`. |
| 10 | The service worker / event page console (`chrome://extensions` → *service worker*; Firefox `about:debugging` → *Inspect*) | Run the tests above | No errors in the console. |

## Tested

The conversion pipeline (fetch, decode, encode, data URL, file names) was run in Chrome 155 with the unpacked build against local test images: transparent PNG to JPG/WebP/PNG, a cross-origin GIF, SVG to PNG and JPG through the offscreen page, a 403 response, an unreachable host and a `data:` URL. The menu handler was also called directly in the service worker (two real downloads saved as JPG and WebP, with the save dialog off), and the popup and options pages load with no console errors and write their settings. A real right-click on the native menu and the Firefox build were not exercised by hand; `web-ext lint` passes on the Firefox build with 0 errors.
