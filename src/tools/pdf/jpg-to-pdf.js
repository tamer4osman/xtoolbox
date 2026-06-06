import { createImageToPdfTool } from './image-to-pdf-tool.js';

export const { toolConfig, render } = createImageToPdfTool({
  id: 'jpg-to-pdf',
  name: 'JPG to PDF Converter',
  description: 'Convert JPG images to PDF documents.',
  accept: '.jpg,.jpeg',
  keywords: ['jpg to pdf', 'jpeg to pdf', 'image to pdf', 'photo to pdf'],
  faqs: [
    { question: 'Can I combine multiple images?', answer: 'Yes, each image becomes a separate page in the PDF.' },
    { question: 'What page sizes are available?', answer: 'Fit to image, A4, Letter, and Legal.' },
    { question: 'Are images compressed?', answer: 'Images are embedded at original quality. You can adjust margins to maximize image size.' }
  ],
  embedImage: (doc, bytes) => doc.embedJpg(bytes),
  fileTypeName: 'JPG',
  fileExtRegex: /\.jpe?g$/i
});
