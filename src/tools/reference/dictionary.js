import { createLookupTool } from "../shared/lookup-tool-factory.js";
import { escapeHtml } from "../../utils/escape-html.js";
import { safeFetch } from "../../utils/safe-fetch.js";

const { toolConfig, render } = createLookupTool({
  toolConfig: {
    id: "dictionary",
    name: "Dictionary",
    category: "reference",
    description: "Look up word definitions, phonetics, examples, and audio pronunciation.",
    icon: "📖",
    status: "done"
  },
  contentHTML: `
    <div class="search-box">
      <input type="text" id="word-input" class="tool-input" placeholder="Enter a word..." />
      <button id="search-btn" class="tool-button primary">Look Up</button>
    </div>
  `,
  resultHTML: `
    <div class="word-header">
      <h2 id="word"></h2>
      <span id="phonetic" class="phonetic"></span>
    </div>
    <div id="meanings"></div>
    <button id="play-audio" class="tool-button secondary">🔊 Play Pronunciation</button>
  `,
  extraCSS: `
    .word-header { text-align: center; margin-bottom: var(--space-6); }
    .word-header h2 { font-size: 2.5rem; margin-bottom: var(--space-2); }
    .phonetic { color: var(--color-text-secondary); font-size: var(--text-lg); }
    .meaning-section { background: var(--color-surface); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .part-of-speech { font-style: italic; color: var(--color-primary); font-weight: 600; margin-bottom: var(--space-3); }
    .definition { margin-bottom: var(--space-2); }
    .example { color: var(--color-text-secondary); font-style: italic; margin-top: var(--space-2); }
    .synonyms { margin-top: var(--space-3); font-size: var(--text-sm); }
    .synonym { display: inline-block; background: var(--color-primary); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); margin-right: var(--space-1); font-size: var(--text-sm); }
  `,
  errorMessage: "Word not found. Please try another word.",
  validate: vals => (!vals["word-input"]?.trim() ? "Enter a word" : null),
  onSearch: async (vals, container) => {
    const word = vals["word-input"].trim();
    const res = await safeFetch(
      "https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word)
    );
    if (!res.ok) throw new Error("Word not found");
    const data = await res.json();
    const entry = data[0];

    container.querySelector("#word").textContent = entry.word;
    container.querySelector("#phonetic").textContent = entry.phonetic || "";

    const meaningsDiv = container.querySelector("#meanings");
    meaningsDiv.innerHTML = "";
    const audioUrl = entry.phonetics?.find(p => p.audio)?.audio || null;
    const playBtn = container.querySelector("#play-audio");
    playBtn.classList.toggle("hidden", !audioUrl);

    entry.meanings.forEach(meaning => {
      const section = document.createElement("div");
      section.className = "meaning-section";
      const defs = meaning.definitions
        .slice(0, 3)
        .map(def => {
          const example = def.example
            ? `<div class="example">"${escapeHtml(def.example)}"</div>`
            : "";
          return `<div class="definition">• ${escapeHtml(def.definition)}</div>${example}`;
        })
        .join("");
      const syns = meaning.synonyms?.length
        ? `<div class="synonyms">Synonyms: ${meaning.synonyms
            .slice(0, 5)
            .map(s => `<span class="synonym">${escapeHtml(s)}</span>`)
            .join("")}</div>`
        : "";
      section.innerHTML = `<div class="part-of-speech">${escapeHtml(meaning.partOfSpeech)}</div>${defs}${syns}`;
      meaningsDiv.appendChild(section);
    });

    if (audioUrl) {
      playBtn.onclick = () => new Audio(audioUrl).play();
    }
  }
});

export { toolConfig, render };
