export function render(container) {
  container.innerHTML = `
    <div class="palette-container">
      <div class="input-row">
        <input type="color" id="baseColor" value="#3b82f6">
        <button id="generateBtn">Generate Palette</button>
      </div>
      <div class="palette" id="palette"></div>
      <div class="palette-info" id="info"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .palette-container { max-width: 800px; margin: 0 auto; }
    .palette-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .input-row { display: flex; gap: var(--space-3); margin-bottom: var(--space-4); }
    #baseColor { width: 60px; height: 40px; padding: 0; border: none; cursor: pointer; }
    #generateBtn { flex: 1; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .palette { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2); margin-bottom: var(--space-4); }
    .color-swatch { aspect-ratio: 1; border-radius: var(--radius-lg); cursor: pointer; display: flex; align-items: flex-end; padding: var(--space-2); font-size: var(--text-xs); color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .palette-info { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); }
    .info-row { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border); }
    .info-row:last-child { border: none; }
    .info-label { font-weight: 500; }
    .info-value { font-family: monospace; font-size: var(--text-sm); }
  `;
  container.appendChild(style);

  function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  function generate() {
    const base = container.querySelector('#baseColor').value;
    const [h, s, l] = hexToHSL(base);
    const colors = [
      hslToHex(h, Math.max(0, s - 30), Math.min(95, l + 40)),
      hslToHex(h, Math.max(0, s - 15), Math.min(90, l + 20)),
      base,
      hslToHex(h, Math.min(100, s + 10), Math.max(10, l - 15)),
      hslToHex(h, Math.min(100, s + 20), Math.max(5, l - 30))
    ];
    container.querySelector('#palette').innerHTML = colors.map(c =>
      `<div class="color-swatch" style="background:${c}" data-color="${c}">${c}</div>`
    ).join('');
    container.querySelector('#info').innerHTML = `
      <div class="info-row"><span class="info-label">Base</span><span class="info-value">${base}</span></div>
      <div class="info-row"><span class="info-label">HSL</span><span class="info-value">hsl(${h}, ${s}%, ${l}%)</span></div>
    `;
    container.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        navigator.clipboard.writeText(swatch.dataset.color);
        swatch.textContent = 'Copied!';
        setTimeout(() => swatch.textContent = swatch.dataset.color, 1000);
      });
    });
  }

  container.querySelector('#generateBtn').addEventListener('click', generate);
  container.querySelector('#baseColor').addEventListener('input', generate);
  generate();
}
