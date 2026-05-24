const PRESETS = {
  fadeIn: { name: 'Fade In', keyframes: 'from { opacity: 0; } to { opacity: 1; }', props: 'opacity' },
  fadeOut: { name: 'Fade Out', keyframes: 'from { opacity: 1; } to { opacity: 0; }', props: 'opacity' },
  slideInLeft: { name: 'Slide In Left', keyframes: 'from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; }', props: 'transform, opacity' },
  slideInRight: { name: 'Slide In Right', keyframes: 'from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; }', props: 'transform, opacity' },
  slideInUp: { name: 'Slide In Up', keyframes: 'from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; }', props: 'transform, opacity' },
  slideInDown: { name: 'Slide In Down', keyframes: 'from { transform: translateY(-100px); opacity: 0; } to { transform: translateY(0); opacity: 1; }', props: 'transform, opacity' },
  bounce: { name: 'Bounce', keyframes: '0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); }', props: 'transform' },
  shake: { name: 'Shake', keyframes: '0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); }', props: 'transform' },
  rotate: { name: 'Rotate', keyframes: 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }', props: 'transform' },
  pulse: { name: 'Pulse', keyframes: '0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); }', props: 'transform' },
  wobble: { name: 'Wobble', keyframes: '0% { transform: rotate(0deg); } 25% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } 75% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); }', props: 'transform' },
  flip: { name: 'Flip', keyframes: '0% { transform: perspective(400px) rotateY(0); } 100% { transform: perspective(400px) rotateY(360deg); }', props: 'transform' },
  zoomIn: { name: 'Zoom In', keyframes: 'from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; }', props: 'transform, opacity' },
  zoomOut: { name: 'Zoom Out', keyframes: 'from { transform: scale(1); opacity: 1; } to { transform: scale(0); opacity: 0; }', props: 'transform, opacity' },
  swing: { name: 'Swing', keyframes: '0% { transform: rotate(0deg); } 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); }', props: 'transform' }
};

const EASINGS = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'];

export function generateCSS(keyframesContent, options) {
  const name = 'anim-' + Date.now().toString(36);
  return `@keyframes ${name} {\n${keyframesContent}\n}\n\n.el {\n  animation: ${name} ${options.duration}s ${options.easing} ${options.delay}s ${options.iterations} ${options.direction} ${options.fillMode};\n}`;
}

export const toolConfig = {
  id: 'css-animation-generator',
  name: 'CSS Animation Generator',
  category: 'css',
  description: 'Visual builder for CSS @keyframes animations with live preview.',
  icon: '🎬',
  accept: null,
  maxSizeMB: null,
  keywords: ['css animation', 'keyframes', 'animation generator', 'css effects', 'motion'],
  steps: ['Choose an animation preset', 'Adjust duration, easing, and other options', 'Copy the generated CSS code'],
  faqs: [
    { question: 'Can I customize the animation?', answer: 'Yes! Adjust duration, delay, easing, iteration count, direction, and fill mode.' },
    { question: 'Does the preview work in real time?', answer: 'The preview updates automatically when you change settings.' }
  ]
};

export function render(container) {
  let currentKeyframes = PRESETS.fadeIn.keyframes;

  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div>
          <div class="form-group">
            <label>Animation Preset</label>
            <select id="cag-preset" class="text-input">${Object.entries(PRESETS).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Duration (s)</label>
            <input type="range" id="cag-duration" min="0.1" max="5" step="0.1" value="1" style="width:100%;">
            <div style="display:flex;justify-content:space-between;"><span id="cag-duration-label">1s</span></div>
          </div>
          <div class="form-group">
            <label>Delay (s)</label>
            <input type="range" id="cag-delay" min="0" max="3" step="0.1" value="0" style="width:100%;">
            <div style="display:flex;justify-content:space-between;"><span id="cag-delay-label">0s</span></div>
          </div>
          <div class="form-group">
            <label>Easing</label>
            <select id="cag-easing" class="text-input">${EASINGS.map(e => `<option value="${e}" ${e === 'ease' ? 'selected' : ''}>${e}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label>Iterations</label>
            <select id="cag-iterations" class="text-input">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="infinite" selected>∞ Infinite</option>
            </select>
          </div>
          <div class="form-group">
            <label>Direction</label>
            <select id="cag-direction" class="text-input">
              <option value="normal">Normal</option>
              <option value="reverse">Reverse</option>
              <option value="alternate">Alternate</option>
              <option value="alternate-reverse">Alternate Reverse</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fill Mode</label>
            <select id="cag-fill" class="text-input">
              <option value="none">None</option>
              <option value="forwards">Forwards</option>
              <option value="backwards">Backwards</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        <div>
          <label>Preview</label>
          <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);height:200px;display:flex;align-items:center;justify-content:center;background:var(--color-bg-secondary);margin-bottom:var(--space-3);overflow:hidden;">
            <div id="cag-preview-box" style="width:80px;height:80px;background:var(--color-primary);border-radius:8px;"></div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Generated CSS</label>
        <textarea id="cag-css" class="text-input" readonly style="width:100%;min-height:120px;font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea>
      </div>
      <button class="btn btn-secondary" id="cag-copy" style="width:100%;">Copy CSS to Clipboard</button>
    </div>
  `;

  const preset = container.querySelector('#cag-preset');
  const duration = container.querySelector('#cag-duration');
  const delay = container.querySelector('#cag-delay');
  const easing = container.querySelector('#cag-easing');
  const iterations = container.querySelector('#cag-iterations');
  const direction = container.querySelector('#cag-direction');
  const fill = container.querySelector('#cag-fill');
  const previewBox = container.querySelector('#cag-preview-box');
  const cssOutput = container.querySelector('#cag-css');
  const copyBtn = container.querySelector('#cag-copy');
  const durationLabel = container.querySelector('#cag-duration-label');
  const delayLabel = container.querySelector('#cag-delay-label');

  function update() {
    const dur = parseFloat(duration.value);
    const del = parseFloat(delay.value);
    durationLabel.textContent = dur + 's';
    delayLabel.textContent = del + 's';

    const options = {
      duration: dur,
      delay: del,
      easing: easing.value,
      iterations: iterations.value,
      direction: direction.value,
      fillMode: fill.value
    };

    const keyframesContent = currentKeyframes;
    const css = generateCSS(keyframesContent, options);
    cssOutput.value = css;

    const animName = css.match(/@keyframes\s+(\S+)/)?.[1] || 'anim';
    previewBox.style.animation = 'none';
    void previewBox.offsetWidth;
    previewBox.style.animation = `${animName} ${options.duration}s ${options.easing} ${options.delay}s ${options.iterations} ${options.direction} ${options.fillMode}`;

    let styleEl = document.getElementById('cag-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'cag-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@keyframes ${animName} {\n${keyframesContent}\n}`;
  }

  preset.addEventListener('change', () => {
    currentKeyframes = PRESETS[preset.value].keyframes;
    update();
  });

  duration.addEventListener('input', update);
  delay.addEventListener('input', update);
  easing.addEventListener('change', update);
  iterations.addEventListener('change', update);
  direction.addEventListener('change', update);
  fill.addEventListener('change', update);

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(cssOutput.value).catch(() => {});
  });

  update();
}

export function destroy() {
  const el = document.getElementById('cag-style');
  if (el) el.remove();
}
