# Store listing: Q3 Save Image As – JPG, PNG, WebP

Use the same text for Chrome Web Store, Microsoft Edge Add-ons, Firefox AMO and Opera add-ons. Upload `dist/q3-image-saver-chrome.zip` to Chrome, Edge and Opera, and `dist/q3-image-saver-firefox.zip` to Firefox.

## Title (max 75 characters)

Q3 Save Image As – JPG, PNG, WebP

## Short summary (max 132 characters)

Right-click any image and save it as JPG, PNG or WebP. Real conversion, done locally. Nothing is uploaded.

## Full description

Save any image as JPG, PNG or WebP with one right-click.

Ever saved a picture and ended up with a WebP or AVIF file that your editor, email client or upload form won't accept? Q3 Save Image As converts the image for real (not just renaming the file) and saves it in the format you choose.

HOW IT WORKS
1. Right-click an image on any website.
2. Choose "Save image as…" and pick JPG, PNG or WebP, or "Save as default format".
3. Choose where to save it. Done.

WHAT YOU CAN DO
• Save image as JPG: convert WebP to JPG, PNG to JPG, AVIF to JPG, GIF to JPG. Transparent areas become white.
• Save WebP as PNG: keep transparency and lossless quality.
• Convert WebP, save as WebP: smaller files for your own site.
• Works with WebP, PNG, JPG, GIF (first frame), AVIF and SVG images.
• Set a default format and the JPG/WebP quality (50–100) in the toolbar popup or on the options page.
• Clean file names: the original name without query strings, with the right extension, or image-YYYYMMDD-HHMMSS when there is none.

PRIVACY FIRST
All conversion happens on your device. Your images are never uploaded, and the extension has no analytics, tracking, accounts or remote code. The only network request is the one that fetches the image you right-clicked. It replaces the removed "Save Image as Type" extension without the baggage.

Some sites protect their images. When a site blocks access, the extension tells you why instead of failing silently.

Made by Q3 Labs. More free tools at q3labs.co/tools.

## Single purpose

Convert an image the user right-clicks to JPG, PNG or WebP and save it to their computer.

## Permission justifications

| Permission | Why it is needed |
|---|---|
| `contextMenus` | Adds the "Save image as…" entry (JPG, PNG, WebP, default) to the right-click menu on images. |
| `downloads` | Saves the converted file, with the "Save as" dialog so the user picks the folder. |
| `storage` | Stores three settings: default format, JPG/WebP quality, and whether to show the save dialog. |
| `notifications` | Shows a short message when an image cannot be converted (for example, the site blocks access to it). |
| `host_permissions: <all_urls>` | Images are hosted on any website, often on a different domain from the page. The extension must fetch the image the user right-clicked in order to convert it. It reads nothing else, and it has no content scripts. |
| `offscreen` (Chrome, Edge, Opera only) | Used only to render SVG images to a canvas. Service workers cannot draw SVG, so a hidden offscreen page loads the SVG in an image element, draws it to a canvas and returns a PNG for conversion. It is created only when the image is an SVG and closed straight afterwards. It is not used for anything else and not requested in Firefox. |

## Firefox AMO notes

- Data collection: none (`data_collection_permissions.required = ["none"]`). Minimum versions are Firefox 140 and Firefox for Android 142, the first releases that support that key.
- Source: the package is the plain, unminified source files; there is no build step beyond zipping. `npm run build` reproduces the zip.
- `web-ext lint` on the Firefox build: 0 errors, 0 warnings, 0 notices.

## Per-store details

Website URL and Privacy policy URL are the same in every store:

- Website URL: https://q3labs.co/extensions/save-image-as/
- Privacy policy URL: https://q3labs.co/extensions/save-image-as/privacy/

| Store | Package | Category | Website URL | Privacy policy URL |
|---|---|---|---|---|
| Chrome Web Store | `dist/q3-image-saver-chrome.zip` | Tools | https://q3labs.co/extensions/save-image-as/ | https://q3labs.co/extensions/save-image-as/privacy/ |
| Microsoft Edge Add-ons | `dist/q3-image-saver-chrome.zip` | Productivity | https://q3labs.co/extensions/save-image-as/ | https://q3labs.co/extensions/save-image-as/privacy/ |
| Firefox AMO | `dist/q3-image-saver-firefox.zip` | Photos, Music & Videos | https://q3labs.co/extensions/save-image-as/ | https://q3labs.co/extensions/save-image-as/privacy/ |
| Opera add-ons | `dist/q3-image-saver-chrome.zip` | Productivity | https://q3labs.co/extensions/save-image-as/ | https://q3labs.co/extensions/save-image-as/privacy/ |

Tags / keywords: save image as jpg, webp to jpg, save webp as png, convert webp, image converter, png to jpg, avif to jpg.

## Store graphics

All in `store-assets/` (PNG): `screenshot-1` to `screenshot-5` at 1280x800 and 640x400 (`-640x400` suffix), `small-promo-tile.png` (440x280), `marquee-promo.png` (1400x560), `store-logo.png` (300x300).
