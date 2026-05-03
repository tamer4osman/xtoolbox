/**
 * Supported languages for OCR
 */
export const OCR_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' },
  { code: 'ita', name: 'Italian' },
  { code: 'tha', name: 'Thai' },
  { code: 'vie', name: 'Vietnamese' },
  { code: 'tur', name: 'Turkish' },
  { code: 'pol', name: 'Polish' },
  { code: 'nld', name: 'Dutch' },
];

/**
 * Recognize text from image source using Tesseract.js
 * @param {string|File|Blob} imageSource - Image URL, File, or Blob
 * @param {string} language - Language code (e.g., 'eng')
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Recognized text
 */
export async function recognizeText(imageSource, language = 'eng', onProgress) {
  const Tesseract = await import('tesseract.js');

  const result = await Tesseract.recognize(imageSource, language, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  return result.data.text;
}

/**
 * Recognize text with detailed info (words, confidence)
 */
export async function recognizeTextDetailed(imageSource, language = 'eng', onProgress) {
  const Tesseract = await import('tesseract.js');

  const result = await Tesseract.recognize(imageSource, language, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words || [],
    lines: result.data.lines || [],
    paragraphs: result.data.paragraphs || []
  };
}
