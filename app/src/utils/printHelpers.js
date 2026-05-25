// Small helper utilities used by fiche printing flows
export async function inlinePublicPng(root, selector = '.fiche-logo', publicPath = '/TT2.png') {
  try {
    if (!root || !selector) return;
    const logoImg = root.querySelector(selector);
    if (!logoImg) return;

    const resp = await fetch(publicPath);
    if (!resp || !resp.ok) return;

    const blob = await resp.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // preserve classes/alt if present
    const cls = logoImg.getAttribute('class') || 'fiche-logo';
    const alt = logoImg.getAttribute('alt') || 'TT logo';
    logoImg.outerHTML = `<img src="${dataUrl}" class="${cls}" alt="${alt}" />`;
  } catch (e) {
    // swallow errors; caller can fallback to existing markup
  }
}
