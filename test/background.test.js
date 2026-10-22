const { test } = require("node:test");
const assert = require("node:assert/strict");
const { baseNameFromUrl, fileNameFor, fallbackName, svgSize, looksLikeSvg } = require("../background.js");

const NOW = new Date(2026, 9, 22, 8, 5, 9);

test("file name: extension replaced, query and hash stripped, %20 decoded", () => {
  assert.equal(fileNameFor("https://cdn.example.com/a/My%20Photo.final.webp?w=800&q=80#top", "jpg", NOW), "My Photo.final.jpg");
  assert.equal(fileNameFor("https://example.com/logo.PNG", "webp", NOW), "logo.webp");
  assert.equal(fileNameFor("https://example.com/pic", "png", NOW), "pic.png");
});

test("file name: unsafe characters are replaced", () => {
  assert.equal(baseNameFromUrl("https://example.com/a%3Fb%2Fc%22d.jpg", NOW), "a_b_c_d");
});

test("file name: falls back to image-YYYYMMDD-HHMMSS", () => {
  assert.equal(fallbackName(NOW), "image-20261022-080509");
  assert.equal(fileNameFor("data:image/png;base64,AAAA", "png", NOW), "image-20261022-080509.png");
  assert.equal(fileNameFor("https://example.com/", "jpg", NOW), "image-20261022-080509.jpg");
  assert.equal(fileNameFor("https://example.com/.webp", "jpg", NOW), "image-20261022-080509.jpg");
  assert.equal(fileNameFor("blob:https://example.com/1234-5678", "jpg", NOW).startsWith("image-"), true);
});

test("file name: a bad percent escape does not throw", () => {
  assert.equal(baseNameFromUrl("https://example.com/100%.png", NOW), "100%");
});

test("svg size comes from width/height, else viewBox, upscaled to at least 1024", () => {
  assert.deepEqual(svgSize('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">'), { width: 1024, height: 512 });
  assert.deepEqual(svgSize('<svg viewBox="0 0 24 24">'), { width: 1024, height: 1024 });
  assert.deepEqual(svgSize('<svg width="2000px" height="1000px">'), { width: 2000, height: 1000 });
  assert.equal(svgSize("<svg>"), null);
});

test("svg detection by type, extension or content", () => {
  assert.equal(looksLikeSvg({ type: "image/svg+xml" }, "https://x.test/a", ""), true);
  assert.equal(looksLikeSvg({ type: "" }, "https://x.test/a.svg?v=1", ""), true);
  assert.equal(looksLikeSvg({ type: "text/plain" }, "https://x.test/a", '<?xml version="1.0"?>\n<svg width="1">'), true);
  assert.equal(looksLikeSvg({ type: "image/png" }, "https://x.test/a.png", "\u0089PNG"), false);
});
