export const toolConfig = {
  id: 'case-converter',
  name: 'Case Converter',
  category: 'text',
  description: 'Convert text to different cases.',
  icon: 'Aa',
  status: 'done'
};

export function render() {
  return `
    <div class="tool-container">
      <header class="tool-header">
        <h1>🔄 Case Converter</h1>
        <p class="tool-description">Convert text between different letter cases</p>
      </header>

      <div class="tool-content">
        <div class="input-group">
          <label>Input Text</label>
          <textarea id="input" placeholder="Enter text to convert..." rows="6"></textarea>
        </div>

        <div class="action-buttons">
          <button id="lowerBtn" class="btn btn-outline">lowercase</button>
          <button id="upperBtn" class="btn btn-outline">UPPERCASE</button>
          <button id="titleBtn" class="btn btn-outline">Title Case</button>
          <button id="sentenceBtn" class="btn btn-outline">Sentence case</button>
          <button id="toggleBtn" class="btn btn-outline">tOgGlE cAsE</button>
        </div>

        <div class="action-buttons">
          <button id="copyBtn" class="btn btn-primary">Copy Result</button>
          <button id="clearBtn" class="btn btn-outline">Clear</button>
        </div>

        <div class="input-group">
          <label>Result</label>
          <textarea id="output" readonly rows="6"></textarea>
        </div>
      </div>
    </div>
  `;
}

export function init() {
  const input = document.getElementById('input');
  const output = document.getElementById('output');

  const toLower = () => output.value = input.value.toLowerCase();
  const toUpper = () => output.value = input.value.toUpperCase();
  const toTitle = () => output.value = input.value.replace(/\\w\\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
  const toSentence = () => output.value = input.value.toLowerCase().replace(/(^\\s*\\w|[.!?]\\s*\\w)/g, c => c.toUpperCase());
  const toToggle = () => output.value = input.value.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');

  document.getElementById('lowerBtn').addEventListener('click', toLower);
  document.getElementById('upperBtn').addEventListener('click', toUpper);
  document.getElementById('titleBtn').addEventListener('click', toTitle);
  document.getElementById('sentenceBtn').addEventListener('click', toSentence);
  document.getElementById('toggleBtn').addEventListener('click', toToggle);

  document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    showToast('Copied!');
  });
  document.getElementById('clearBtn').addEventListener('click', () => { input.value = ''; output.value = ''; });
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}