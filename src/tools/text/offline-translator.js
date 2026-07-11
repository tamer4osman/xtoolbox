import { showToast } from "../../components/toast.js";

export const toolConfig = {
  id: "offline-translator",
  name: "Offline Text Translator",
  category: "text",
  description: "Translate text between 50+ languages offline using Transformers.js.",
  icon: "🌐",
  accept: ".txt",
  maxSizeMB: 1,
  keywords: ["translate", "offline", "language", "text", "nllb", "transformers"],
  steps: [
    "Enter or paste text to translate",
    "Select source and target languages",
    "Click Translate"
  ],
  faqs: [
    {
      question: "Is translation really offline?",
      answer: "Yes. The translation model runs entirely in your browser using WebAssembly."
    },
    {
      question: "How many languages are supported?",
      answer:
        "50+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and more."
    }
  ]
};

export const LANGUAGES = [
  { code: "en", name: "English", nllb: "eng_Latn" },
  { code: "es", name: "Spanish", nllb: "spa_Latn" },
  { code: "fr", name: "French", nllb: "fra_Latn" },
  { code: "de", name: "German", nllb: "deu_Latn" },
  { code: "it", name: "Italian", nllb: "ita_Latn" },
  { code: "pt", name: "Portuguese", nllb: "por_Latn" },
  { code: "zh", name: "Chinese", nllb: "zho_Hans" },
  { code: "ja", name: "Japanese", nllb: "jpn_Jpan" },
  { code: "ko", name: "Korean", nllb: "kor_Hang" },
  { code: "ar", name: "Arabic", nllb: "arb_Arab" },
  { code: "ru", name: "Russian", nllb: "rus_Cyrl" },
  { code: "hi", name: "Hindi", nllb: "hin_Deva" },
  { code: "bn", name: "Bengali", nllb: "ben_Beng" },
  { code: "pa", name: "Punjabi", nllb: "pan_Guru" },
  { code: "tr", name: "Turkish", nllb: "tur_Latn" },
  { code: "vi", name: "Vietnamese", nllb: "vie_Latn" },
  { code: "th", name: "Thai", nllb: "tha_Thai" },
  { code: "nl", name: "Dutch", nllb: "nld_Latn" },
  { code: "pl", name: "Polish", nllb: "pol_Latn" },
  { code: "sv", name: "Swedish", nllb: "swe_Latn" }
];

export function estimateTokenCount(text) {
  return text.split(/\s+/).length;
}

export function render(container) {
  let translator = null;

  container.innerHTML = `
    <div class="tool-layout">
      <div class="form-row">
        <div class="form-group" style="flex:1;">
          <label for="src-lang">From</label>
          <select id="src-lang" class="text-input">
            ${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === "en" ? "selected" : ""}>${l.name}</option>`).join("")}
          </select>
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:var(--space-2);">
          <button class="btn btn-secondary btn-sm" id="swap-btn" title="Swap languages">&#8646;</button>
        </div>
        <div class="form-group" style="flex:1;">
          <label for="tgt-lang">To</label>
          <select id="tgt-lang" class="text-input">
            ${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === "es" ? "selected" : ""}>${l.name}</option>`).join("")}
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

  const srcLang = container.querySelector("#src-lang");
  const tgtLang = container.querySelector("#tgt-lang");
  const srcText = container.querySelector("#src-text");
  const tgtText = container.querySelector("#tgt-text");
  const translateBtn = container.querySelector("#translate-btn");
  const swapBtn = container.querySelector("#swap-btn");

  swapBtn.addEventListener("click", () => {
    const tmp = srcLang.value;
    srcLang.value = tgtLang.value;
    tgtLang.value = tmp;
    const tmpText = srcText.value;
    srcText.value = tgtText.value;
    tgtText.value = tmpText;
  });

  translateBtn.addEventListener("click", async () => {
    const text = srcText.value.trim();
    if (!text) {
      showToast({ message: "Enter text to translate.", type: "error" });
      return;
    }

    translateBtn.disabled = true;
    translateBtn.textContent = "Loading model...";

    try {
      const { pipeline } =
        await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.js");
      if (!translator) {
        translateBtn.textContent = "Translating...";
        translator = await pipeline("translation", "Xenova/nllb-200-distilled-600M", {
          progress_callback: progress => {
            if (progress.status === "downloading") {
              translateBtn.textContent = `Downloading: ${progress.progress?.toFixed(0) || 0}%`;
            }
          }
        });
      }

      translateBtn.textContent = "Translating...";
      const srcNllb = LANGUAGES.find(l => l.code === srcLang.value)?.nllb;
      const tgtNllb = LANGUAGES.find(l => l.code === tgtLang.value)?.nllb;
      if (!srcNllb || !tgtNllb) {
        throw new Error("Unsupported language pair");
      }
      const result = await translator(text, {
        tgt_lang: tgtNllb,
        src_lang: srcNllb
      });
      tgtText.value = result[0]?.translation_text || "";
      showToast({ message: "Translation complete.", type: "success" });
    } catch (err) {
      showToast({ message: `Translation failed: ${err.message}`, type: "error" });
    } finally {
      translateBtn.disabled = false;
      translateBtn.textContent = "Translate";
    }
  });
}

export function destroy() {}
