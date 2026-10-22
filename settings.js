// Shared by the popup and the options page. background.js keeps its own copy of the defaults.
const api = globalThis.browser ?? globalThis.chrome;

const Q3 = {
  defaults: { defaultFormat: "jpg", quality: 92, showSaveDialog: true },
  async load() {
    const stored = await api.storage.sync.get(Q3.defaults);
    return {
      defaultFormat: ["jpg", "png", "webp"].includes(stored.defaultFormat) ? stored.defaultFormat : Q3.defaults.defaultFormat,
      quality: Math.min(100, Math.max(50, Number(stored.quality) || Q3.defaults.quality)),
      showSaveDialog: stored.showSaveDialog !== false,
    };
  },
  save(patch) {
    return api.storage.sync.set(patch);
  },
};
