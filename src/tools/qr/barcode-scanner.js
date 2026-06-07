import { Html5Qrcode } from 'html5-qrcode';
import { createScanner } from './scanner-factory.js';

export const toolConfig = {
  id: 'barcode-scanner',
  name: 'Barcode Scanner',
  category: 'qr',
  description: 'Scan and decode barcodes from images.',
  icon: '📷',
  status: 'done'
};

export function render(container) {
  const scanner = createScanner({
    container,
    toolConfig,
    scanLabel: 'barcode',
    resultTitle: 'Decoded Barcode',
    resultMetaId: 'result-format',
    hasCamera: false,
    hasOpenUrl: false,
    onScanFile: async (file) => {
      try {
        const html5QrCode = new Html5Qrcode('barcode-scanner-reader');
        const result = await html5QrCode.scanFile(file, true);
        const formatName = result.result.format?.formatName || 'Unknown';
        scanner.showResult(result.text, `Format: ${formatName}`);
      } catch {
        scanner.showError('No barcode found. Try a clearer image.');
      }
    }
  });
}
