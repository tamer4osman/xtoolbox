export function render(container) {
  container.innerHTML = `
    <div class="morse-container">
      <div class="codec-tabs"><button class="tab active" data-tab="encode">Text to Morse</button><button class="tab" data-tab="decode">Morse to Text</button></div>
      <div class="panel active" id="encode">
        <textarea id="enc-input" placeholder="Enter text...">Hello World</textarea>
        <div class="output"><pre id="enc-output"></pre></div>
      </div>
      <div class="panel" id="decode">
        <textarea id="dec-input" placeholder="Enter morse code (. and - separated by spaces)...">.... . .-.. .-.. --- / .-- --- .-. .-.. -..</textarea>
        <div class="output"><pre id="dec-output"></pre></div>
      </div>
      <div class="reference">
        <h3>Reference</h3>
        <div class="ref-grid">
          <span>A .-</span><span>B -...</span><span>C -.-.</span><span>D -..</span>
          <span>E .</span><span>F ..-.</span><span>G --.</span><span>H ....</span>
          <span>I ..</span><span>J .---</span><span>K -.-</span><span>L .-..</span>
          <span>M --</span><span>N -.</span><span>O ---</span><span>P .--.</span>
          <span>Q --.-</span><span>R .-.</span><span>S ...</span><span>T -</span>
          <span>U ..-</span><span>V ...-</span><span>W .--</span><span>X -..-</span>
          <span>Y -.--</span><span>Z --..</span><span>0 -----</span><span>1 .----</span>
          <span>2 ..---</span><span>3 ...--</span><span>4 ....-</span><span>5 .....</span>
          <span>6 -....</span><span>7 --...</span><span>8 ---..</span><span>9 ----.</span>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .morse-container { max-width: 700px; margin: 0 auto; }
    .morse-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .codec-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .codec-tabs .tab { flex: 1; padding: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); cursor: pointer; }
    .codec-tabs .tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .panel { display: none; }
    .panel.active { display: block; }
    .panel textarea { width: 100%; height: 100px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); margin-bottom: var(--space-4); resize: vertical; }
    .output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .output pre { margin: 0; font-family: monospace; font-size: var(--text-sm); word-break: break-all; }
    .reference { margin-top: var(--space-4); background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
    .reference h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
    .ref-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-2); font-family: monospace; font-size: var(--text-xs); }
  `;
  container.appendChild(style);

  const morseToChar = {'.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9'};
  const charToMorse = Object.fromEntries(Object.entries(morseToChar).map(([k, v]) => [v, k]));

  container.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    container.querySelectorAll('.tab, .panel').forEach(el => el.classList.remove('active'));
    t.classList.add('active');
    container.querySelector('#' + t.dataset.tab).classList.add('active');
  }));

  container.querySelector('#enc-input').addEventListener('input', () => {
    const text = container.querySelector('#enc-input').value.toUpperCase();
    container.querySelector('#enc-output').textContent = text.split('').map(c => c === ' ' ? '/' : charToMorse[c] || c).join(' ');
  });

  container.querySelector('#dec-input').addEventListener('input', () => {
    const morse = container.querySelector('#dec-input').value;
    container.querySelector('#dec-output').textContent = morse.split(' / ').map(word => word.split(' ').map(code => morseToChar[code] || code).join('')).join(' ');
  });

  container.querySelector('#enc-input').dispatchEvent(new Event('input'));
}
