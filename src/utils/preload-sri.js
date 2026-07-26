const loaded = new Map();

export function preloadScriptSri(url, integrity) {
  if (loaded.has(url)) return loaded.get(url);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(url);
    script.onerror = () => reject(new Error(`SRI preload failed: ${url}`));
    document.head.appendChild(script);
  });

  loaded.set(url, promise);
  return promise;
}
