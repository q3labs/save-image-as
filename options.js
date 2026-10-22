const format = document.getElementById("format");
const quality = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");
const qualityField = document.getElementById("quality-field");
const dialog = document.getElementById("dialog");
const statusEl = document.getElementById("status");

let timer;
function saved() {
  statusEl.textContent = "Saved";
  clearTimeout(timer);
  timer = setTimeout(() => (statusEl.textContent = ""), 1500);
}

function showQuality() {
  qualityValue.textContent = quality.value;
  qualityField.classList.toggle("hidden", format.value === "png");
}

Q3.load().then((settings) => {
  format.value = settings.defaultFormat;
  quality.value = String(settings.quality);
  dialog.checked = settings.showSaveDialog;
  showQuality();
});

format.addEventListener("change", () => {
  showQuality();
  Q3.save({ defaultFormat: format.value }).then(saved);
});
quality.addEventListener("input", showQuality);
quality.addEventListener("change", () => Q3.save({ quality: Number(quality.value) }).then(saved));
dialog.addEventListener("change", () => Q3.save({ showSaveDialog: dialog.checked }).then(saved));
