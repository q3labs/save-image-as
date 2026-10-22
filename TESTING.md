# Testing

Manual test plan and what has been tested. Build first (`npm run build`) and load the extension as described in the README.

## Manual test plan

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
