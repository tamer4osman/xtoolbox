import { showToast } from '../../components/toast.js';

export const toolConfig = {
  id: 'offline-translator',
  name: 'Offline Text Translator',
  category: 'text',
  description: 'Translate text between 50+ languages offline using Transformers.js.',
  icon: '🌐',
  accept: '.txt',
  maxSizeMB: 1,
  keywords: ['translate', 'offline', 'language', 'text', 'nllb', 'transformers'],
  steps: ['Enter or paste text to translate', 'Select source and target languages', 'Click Translate'],
  faqs: [
    { question: 'Is translation really offline?', answer: 'Yes. The translation model runs entirely in your browser using WebAssembly.' },
    { question: 'How many languages are supported?', answer: '50+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and more.' }
  ]
};

export const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' }, { code: 'ru', name: 'Russian' }, { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' }, { code: 'pa', name: 'Punjabi' }, { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' }, { code: 'th', name: 'Thai' }, { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' }, { code: 'sv', name: 'Swedish' }
];

export function estimateTokenCount(text) {
  return text.split(/\s+/).length;
}

export function render(container) {
  let translator = null;
  let loading = false;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label for="src-lang">From</label>
          <select id="src-lang" class="text-input">
            ${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === 'en' ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:var(--space-2);">
          <button class="btn btn-secondary btn-sm" id="swap-btn" title="Swap languages">&#8646;</button>
        </div>
        <div class="form-group" style="flex:1;">
          <label for="tgt-lang">To</label>
          <select id="tgt-lang" class="text-input">
            ${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === 'es' ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="src-text">Source Text</label>
        <textarea id="src-text" class="text-input" rows="6" placeholder="Enter text to translate..."></textarea>
      </div>
      <button class="btn btn-primary btn-lg" id="translate-btn" style="width:100%;">Translate</button>
      <div class="form-group" style="margin-top:var(--space-3);">
        <label for="tgt-text">Translation</label>
        <textarea id="tgt-text" class="text-input" rows="6" readonly placeholder="Translation will appear here..."></textarea>
      </div>
    </div>
  `;

  const srcLang = container.querySelector('#src-lang');
  const tgtLang = container.querySelector('#tgt-lang');
  const srcText = container.querySelector('#src-text');
  const tgtText = container.querySelector('#tgt-text');
  const translateBtn = container.querySelector('#translate-btn');
  const swapBtn = container.querySelector('#swap-btn');

  swapBtn.addEventListener('click', () => {
    const tmp = srcLang.value;
    srcLang.value = tgtLang.value;
    tgtLang.value = tmp;
    const tmpText = srcText.value;
    srcText.value = tgtText.value;
    tgtText.value = tmpText;
  });

  translateBtn.addEventListener('click', async () => {
    const text = srcText.value.trim();
    if (!text) {
      showToast({ message: 'Enter text to translate.', type: 'error' });
      return;
    }

    translateBtn.disabled = true;
    translateBtn.textContent = 'Loading model...';
    loading = true;

    try {
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.js');
      if (!translator) {
        translateBtn.textContent = 'Translating...';
        translator = await pipeline('translation', 'Xenova/nllb-200-distilled-600M', {
          progress_callback: (progress) => {
            if (progress.status === 'downloading') {
              translateBtn.textContent = `Downloading: ${progress.progress?.toFixed(0) || 0}%`;
            }
          }
        });
      }

      translateBtn.textContent = 'Translating...';
      const result = await translator(text, {
        tgt_lang: tgtLang.value,
        src_lang: srcLang.value
      });
      tgtText.value = result[0]?.translation_text || '';
      showToast({ message: 'Translation complete.', type: 'success' });
    } catch (err) {
      showToast({ message: `Translation failed: ${err.message}`, type: 'error' });
    } finally {
      translateBtn.disabled = false;
      translateBtn.textContent = 'Translate';
      loading = false;
    }
  });
}

export function destroy() {}
