// Chrome, Edge and Opera only: a service worker has no DOM, so this hidden page draws an SVG
// to a PNG for background.js. The SVG is loaded through <img>, which runs no scripts and
// fetches nothing from the network.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.target !== "q3-offscreen" || message.type !== "render-svg") return false;
  const { text, size } = message;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.getContext("2d").drawImage(img, 0, 0, size.width, size.height);
    sendResponse({ dataUrl: canvas.toDataURL("image/png") });
  };
  img.onerror = () => sendResponse({ dataUrl: null });
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
  return true;
});
