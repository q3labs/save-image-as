const format = document.getElementById("format");
const quality = document.getElementById("quality");
const qualityValue = document.getElementById("quality-value");
const qualityField = document.getElementById("quality-field");

function showQuality() {
  qualityValue.textContent = quality.value;
  qualityField.classList.toggle("hidden", format.value === "png");
}

Q3.load().then((settings) => {
  format.value = settings.defaultFormat;
  quality.value = String(settings.quality);
  showQuality();
});

format.addEventListener("change", () => {
  showQuality();
  Q3.save({ defaultFormat: format.value });
});
quality.addEventListener("input", showQuality);
quality.addEventListener("change", () => Q3.save({ quality: Number(quality.value) }));
