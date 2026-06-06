import { createFormatConverterTool } from './format-converter-tool.js';

export const toolConfig = {
  id: 'webp-to-jpg',
  name: 'WebP to JPG Converter',
  category: 'image',
  description: 'Convert WebP images to JPG with quality control.',
  icon: '',
  accept: '.webp',
  maxSizeMB: 50,
  keywords: ['webp to jpg', 'webp to jpeg', 'convert webp', 'webp converter'],
  steps: ['Upload WebP image(s)', 'Adjust quality and background color', 'Click "Convert to JPG"', 'Download converted images'],
  faqs: [
    { question: 'What happens to transparency?', answer: 'WebP transparency is replaced with the background color you choose (default: white).' },
    { question: 'What quality should I use?', answer: '80-90% is good for most images. Lower for smaller files, higher for best quality.' },
    { question: 'Can I convert multiple WebPs?', answer: 'Yes, upload multiple WebPs and they will all be converted.' }
  ]
};

export const render = createFormatConverterTool({
  accept: toolConfig.accept,
  maxSizeMB: toolConfig.maxSizeMB,
  sourceFormatName: 'WebP',
  sourceExtRegex: /\.webp$/i,
  targetFormatName: 'JPG',
  targetMime: 'image/jpeg',
  targetExt: '.jpg',
  qualityDefault: 92,
  fillBackgroundColor: true
});

export function destroy() {}
