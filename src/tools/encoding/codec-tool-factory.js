import { CODEC_CSS } from '../shared/codec-css.js';

export function createCodecTool(config) {
  return {
    toolConfig: config.toolConfig,
    render(container) {
      container.innerHTML = `
        <div class="codec-container">
          <div class="codec-tabs"><button class="tab active" data-tab="encode">Encode</button><button class="tab" data-tab="decode">Decode</button></div>
          <div class="panel active" id="encode">
            <textarea id="enc-input" placeholder="${config.encodePlaceholder}">${config.encodeDefault || ''}</textarea>
            <div class="output"><span>${config.encodeLabel}:</span><pre id="enc-output"></pre></div>
          </div>
          <div class="panel" id="decode">
            <textarea id="dec-input" placeholder="${config.decodePlaceholder}">${config.decodeDefault || ''}</textarea>
            <div class="output"><span>${config.decodeLabel}:</span><pre id="dec-output"></pre></div>
          </div>
          ${config.extraHTML || ''}
        </div>
      `;

      const style = document.createElement('style');
      style.textContent = CODEC_CSS + (config.extraCSS || '');
      container.appendChild(style);

      container.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
        container.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
        t.classList.add('active');
        container.querySelector('#' + t.dataset.tab).classList.add('active');
      }));

      container.querySelector('#enc-input').addEventListener('input', () => {
        try { container.querySelector('#enc-output').textContent = config.encode(container.querySelector('#enc-input').value); }
        catch { container.querySelector('#enc-output').textContent = 'Invalid input'; }
      });

      container.querySelector('#dec-input').addEventListener('input', () => {
        try { container.querySelector('#dec-output').textContent = config.decode(container.querySelector('#dec-input').value); }
        catch { container.querySelector('#dec-output').textContent = 'Invalid input'; }
      });

      container.querySelector('#enc-input').dispatchEvent(new Event('input'));
    }
  };
}
