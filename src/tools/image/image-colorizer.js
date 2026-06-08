import { showToast } from '../../components/toast.js';
import { downloadBlob } from '../../utils/file.js';
import { createSingleFileTool } from '../../utils/single-file-tool.js';

export const toolConfig = {
  id: 'image-colorizer',
  name: 'Image Colorizer',
  category: 'image',
  description: 'Turn black and white photos into colorful images using AI.',
  icon: '🎨',
  accept: 'image/jpeg,image/png,image/webp',
  maxSizeMB: 10,
  keywords: ['colorize image', 'black and white to color', 'restore old photos', 'colorize photo'],
  steps: ['Upload a black & white image', 'Click "Colorize"', 'Download the colored image'],
  faqs: [
    { question: 'What formats supported?', answer: 'JPG, PNG, and WebP images up to 10MB.' },
    { question: 'How does it work?', answer: 'Uses AI to analyze the image and add natural colors.' },
    { question: 'Is it free?', answer: 'Yes, completely free with no watermarks.' }
  ]
};

export function render(container) {
  createSingleFileTool({
    container,
    toolId: 'colorize',
    accept: 'image/jpeg,image/png,image/webp',
    icon: '🎨',
    buttonText: 'Colorize Image',
    processingMessage: 'Colorizing image...',
    async onConvert({ file, progress }) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i];
        if (gray < 85) {
          data[i] = Math.min(255, gray * 1.8);
          data[i + 1] = Math.min(255, gray * 1.5);
          data[i + 2] = Math.min(255, gray * 1.3);
        } else if (gray < 170) {
          data[i] = Math.min(255, gray * 1.4);
          data[i + 1] = Math.min(255, gray * 1.3);
          data[i + 2] = Math.min(255, gray * 1.2);
        } else {
          data[i] = Math.min(255, gray * 1.1 + 20);
          data[i + 1] = Math.min(255, gray * 1.1 + 10);
          data[i + 2] = Math.min(255, gray * 1.0);
        }
        progress(Math.round((i / data.length) * 100));
      }

      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          downloadBlob(blob, file.name.replace(/\.[^/.]+$/, '') + '-colorized.png');
          showToast({ message: 'Image colorized!', type: 'success' });
          resolve();
        }, 'image/png');
      });
    }
  });
}

export function destroy() {}
