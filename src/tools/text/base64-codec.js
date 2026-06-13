import { createCodecTool } from '../shared/codec-factory.js';

export const toolConfig = {
  id: 'base64-codec',
  name: 'Base64 Codec',
  category: 'encoding',
  description: 'Encode and decode Base64.',
  icon: '🔤',
  status: 'done'
};

export const initBase64Codec = createCodecTool({
  inputId: 'base64-input',
  outputId: 'base64-output',
  encodeId: 'encode-base64',
  decodeId: 'decode-base64',
  copyId: 'copy-base64',
  clearId: 'clear-base64',
  encode: (v) => btoa(v),
  decode: (v) => atob(v)
});