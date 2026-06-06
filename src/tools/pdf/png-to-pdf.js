import { createImageToPdfTool } from './image-to-pdf-tool.js';

export const { toolConfig, render } = createImageToPdfTool({
  id: 'png-to-pdf',
  name: 'PNG to PDF Converter',
  description: 'Convert PNG images to PDF documents.',
  accept: '.png',
  keywords: ['png to pdf', 'image to pdf', 'photo to pdf', 'png converter'],
  faqs: [
    { question: 'Can I combine multiple images?', answer: 'Yes, each image becomes a separate page in the PDF.' },
    { question: 'What page sizes are available?', answer: 'Fit to image, A4, Letter, and Legal.' },
    { question: 'Is transparency preserved?', answer: 'Yes, PNG transparency is preserved in the PDF.' }
  ],
  embedImage: (doc, bytes) => doc.embedPng(bytes),
  fileTypeName: 'PNG',
  fileExtRegex: /\.png$/i
});
