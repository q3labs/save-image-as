import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

const browser = {
  chrome: "readonly", browser: "readonly", document: "readonly", window: "readonly", fetch: "readonly",
  Image: "readonly", OffscreenCanvas: "readonly", createImageBitmap: "readonly", globalThis: "readonly",
  URL: "readonly", Blob: "readonly", Uint8Array: "readonly", Promise: "readonly", btoa: "readonly",
  clearTimeout: "readonly", setTimeout: "readonly", module: "readonly", console: "readonly",
};

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**"]),
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "script", ecmaVersion: 2023, globals: browser },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: { sourceType: "module", ecmaVersion: 2023, globals: { console: "readonly", Buffer: "readonly", structuredClone: "readonly", document: "readonly", window: "readonly", Image: "readonly", btoa: "readonly", Uint8Array: "readonly" } },
  },
  {
    files: ["popup.js", "options.js"],
    languageOptions: { globals: { Q3: "readonly" } },
  },
  {
    files: ["test/**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: { require: "readonly", module: "readonly" } },
  },
]);
