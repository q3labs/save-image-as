# Contributing

Thanks for helping. This extension is deliberately small and privacy-first, so changes that keep it that way are the easiest to accept: no analytics, no remote code, no new permissions unless they are essential.

## Setup

```
npm install
npm run build
npm test
npm run lint
```

Load `dist/chrome` (Chrome, Edge, Opera) or `dist/firefox/manifest.json` (Firefox) as described in the [README](README.md).

## Pull requests

1. Open an issue first for anything bigger than a small fix.
2. Keep the change focused. `npm test` and `npm run lint` must pass, and `npm run lint:firefox` must show no errors or warnings.
3. Work through the [manual test plan](TESTING.md) for anything that touches conversion, downloads or the menu.
4. Do not add libraries without a strong reason; the extension has no runtime dependencies.

By contributing you agree that your contribution is licensed under the [MIT license](LICENSE).

## Security

Report vulnerabilities privately; see [SECURITY.md](SECURITY.md).
