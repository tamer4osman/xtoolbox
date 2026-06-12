import { createCodecTool } from './codec-tool-factory.js';

const morseToChar = {'.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '-----.': '9'};
const charToMorse = Object.fromEntries(Object.entries(morseToChar).map(([k, v]) => [v, k]));

const EXTRA_CSS = `
  .morse-container { max-width: 700px; margin: 0 auto; }
  .reference { margin-top: var(--space-4); background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); }
  .reference h3 { font-size: var(--text-sm); margin-bottom: var(--space-3); }
  .ref-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-2); font-family: monospace; font-size: var(--text-xs); }
`;

export const { toolConfig, render } = createCodecTool({
  toolConfig: { id: 'morse-code', name: 'Morse Code', category: 'encoding', description: 'Morse code translator.', icon: '📡', status: 'done' },
  encodePlaceholder: 'Enter text...',
  encodeDefault: 'Hello World',
  encodeLabel: 'Morse',
  decodePlaceholder: 'Enter morse code (. and - separated by spaces)...',
  decodeDefault: '.... . .-.. .-.. --- / .-- --- .-. .-.. -..',
  decodeLabel: 'Text',
  encode: (s) => s.toUpperCase().split('').map(c => c === ' ' ? '/' : charToMorse[c] || c).join(' '),
  decode: (s) => s.split(' / ').map(word => word.split(' ').map(code => morseToChar[code] || code).join('')).join(' '),
  extraHTML: `<div class="reference"><h3>Reference</h3><div class="ref-grid"><span>A .-</span><span>B -...</span><span>C -.-.</span><span>D -..</span><span>E .</span><span>F ..-.</span><span>G --.</span><span>H ....</span><span>I ..</span><span>J .---</span><span>K -.-</span><span>L .-..</span><span>M --</span><span>N -.</span><span>O ---</span><span>P .--.</span><span>Q --.-</span><span>R .-.</span><span>S ...</span><span>T -</span><span>U ..-</span><span>V ...-</span><span>W .--</span><span>X -..-</span><span>Y -.--</span><span>Z --..</span><span>0 -----</span><span>1 .----</span><span>2 ..---</span><span>3 ...--</span><span>4 ....-</span><span>5 .....</span><span>6 -....</span><span>7 --...</span><span>8 ---..</span><span>9 ----.</span></div></div>`,
  extraCSS: EXTRA_CSS,
});
