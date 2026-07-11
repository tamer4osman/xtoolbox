/**
 * Create an ad slot element
 */
export function createAdSlot({ slot, format = "auto", responsive = true }) {
  const container = document.createElement("div");
  container.className = "ad-slot";
  container.innerHTML = `
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot="${slot}"
      data-ad-format="${format}"
      data-full-width-responsive="${responsive ? "yes" : "no"}"
    ></ins>
  `;

  requestAnimationFrame(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet
    }
  });

  return container;
}
