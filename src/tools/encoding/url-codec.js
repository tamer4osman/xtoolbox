import { createCodecTool } from './codec-tool-factory.js';

export const { toolConfig, render } = createCodecTool({
  toolConfig: { id: 'url-codec', name: 'URL Encoder', category: 'encoding', description: 'Encode and decode URL.', icon: '🔗', status: 'done' },
  encodePlaceholder: 'Text to encode...',
  encodeDefault: 'Hello World! ?foo=bar',
  encodeLabel: 'Encoded',
  decodePlaceholder: 'URL encoded text...',
  decodeLabel: 'Decoded',
  encode: (s) => encodeURIComponent(s),
  decode: (s) => decodeURIComponent(s),
});
