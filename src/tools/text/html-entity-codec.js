import { createCodecTool } from '../shared/codec-factory.js';

export const toolConfig = {
  id: 'html-entity-codec',
  name: 'HTML Entity Encoder',
  category: 'encoding',
  description: 'Encode HTML entities.',
  icon: '🏷️',
  status: 'done'
};

export const initHtmlEntityCodec = createCodecTool({
  inputId: 'html-entity-input',
  outputId: 'html-entity-output',
  encodeId: 'encode-html-entity',
  decodeId: 'decode-html-entity',
  copyId: 'copy-html-entity',
  clearId: 'clear-html-entity',
  encode: (v) => { const d = document.createElement('div'); d.textContent = v; return d.innerHTML; },
  decode: (v) => { const d = document.createElement('div'); d.innerHTML = v; return d.textContent; }
});