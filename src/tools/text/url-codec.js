import { createCodecTool } from '../shared/codec-factory.js';

export const toolConfig = {
  id: 'url-codec',
  name: 'URL Encoder',
  category: 'encoding',
  description: 'Encode and decode URL.',
  icon: '🔗',
  status: 'done'
};

export const initUrlCodec = createCodecTool({
  inputId: 'url-input',
  outputId: 'url-output',
  encodeId: 'encode-url',
  decodeId: 'decode-url',
  copyId: 'copy-url',
  clearId: 'clear-url',
  encode: (v) => encodeURIComponent(v),
  decode: (v) => decodeURIComponent(v)
});