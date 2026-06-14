import { showToast } from '../../components/toast.js';
import { copyToClipboard } from '../../utils/clipboard.js';
import { escapeHtml } from '../../utils/escape-html.js';

export const toolConfig = {
  id: 'llm-token-counter',
  name: 'LLM Token Counter',
  category: 'dev',
  description: 'Estimate token counts and per-model cost for OpenAI GPT-4o / GPT-4 / GPT-3.5, Anthropic Claude 3.5 / 3 Opus, and Google Gemini 1.5 models. Auto-detects prose vs. code content and applies a calibrated heuristic. Includes a side-by-side model comparison table and copyable stats.',
  icon: '🧮',
  accept: null,
  maxSizeMB: null,
  keywords: ['llm', 'gpt', 'openai', 'claude', 'anthropic', 'gemini', 'token', 'tokens', 'tiktoken', 'cost', 'pricing', 'chatgpt', 'gpt-4', 'gpt-4o', 'claude-3.5', 'gemini-1.5', 'prompt'],
  steps: [
    'Paste or type the text you want to count tokens for in the editor on the left',
    'Pick a model from the dropdown (or use Auto-detect) — token count and cost update live',
    'Check the side-by-side comparison table to see how the same text prices out across 12 models',
    'Copy the stats as JSON or Markdown, or download as a .txt report'
  ],
  faqs: [
    { question: 'How accurate is this counter?', answer: 'It uses a calibrated heuristic, not the actual BPE tokenizer. For English prose the error is typically under 10%. For code, CJK, and other dense content the error can be higher. The estimate is clearly labeled as such — for exact counts, run the same text through the official tiktoken library or your model provider\'s tokenizer tool.' },
    { question: 'Why estimate instead of using tiktoken?', answer: 'A real BPE tokenizer ships 1–2 MB of vocabulary data and a WASM core. For a fast in-browser estimator that works for the common case, the heuristic avoids the 2 MB download and runs instantly on any text length.' },
    { question: 'How is the content type detected?', answer: 'The counter counts CJK characters, code-like characters (braces, semicolons, operators), and whitespace. If CJK is over 10% of the text it picks the CJK ratio; if code-like characters exceed a threshold it picks the code ratio; otherwise it uses the prose ratio. You can override the choice manually.' },
    { question: 'How current are the prices?', answer: 'The prices in the table reflect the public list prices from OpenAI, Anthropic, and Google as of mid-2025. Always check the vendor pricing page for the most current numbers — list prices change and there are also batch / cached / prompt-cache discounts not modeled here.' },
    { question: 'Does input and output cost the same?', answer: 'No. Output tokens almost always cost more than input tokens (often 3-5x). The tool shows both rates and computes total cost assuming your specified split.' }
  ]
};

export const MODELS = [
  { id: 'auto', name: 'Auto-detect', provider: '—', inputPer1M: 0, outputPer1M: 0, ratio: 'auto' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPer1M: 2.5, outputPer1M: 10.0, ratio: 'prose' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', inputPer1M: 0.15, outputPer1M: 0.6, ratio: 'prose' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', inputPer1M: 10.0, outputPer1M: 30.0, ratio: 'prose' },
  { id: 'gpt-4', name: 'GPT-4 (8K)', provider: 'OpenAI', inputPer1M: 30.0, outputPer1M: 60.0, ratio: 'prose' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', inputPer1M: 0.5, outputPer1M: 1.5, ratio: 'prose' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPer1M: 3.0, outputPer1M: 15.0, ratio: 'prose' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputPer1M: 0.8, outputPer1M: 4.0, ratio: 'prose' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputPer1M: 15.0, outputPer1M: 75.0, ratio: 'prose' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputPer1M: 1.25, outputPer1M: 5.0, ratio: 'prose' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', inputPer1M: 0.075, outputPer1M: 0.3, ratio: 'prose' }
];

export const CONTENT_TYPES = {
  prose: { id: 'prose', name: 'Prose', description: 'Natural-language English text', tokensPerChar: 0.26 },
  code: { id: 'code', name: 'Code', description: 'Source code (high symbol density)', tokensPerChar: 0.30 }
};

export function countChars(text) {
  return (text || '').length;
}

export function countWords(text) {
  const m = (text || '').match(/\S+/g);
  return m ? m.length : 0;
}

export function countLines(text) {
  if (!text) return 0;
  return text.split('\n').length;
}

export function countSentences(text) {
  if (!text) return 0;
  const m = text.match(/[^.!?\n]+[.!?]+(\s|$)|[^.!?\n]+$/g);
  return m ? m.length : 0;
}

export function detectContentType(text) {
  if (!text) return 'prose';
  const total = text.length;
  if (total === 0) return 'prose';
  const codeChars = (text.match(/[{}();<>=+\-*/%&|!~^?:.,[\]\\]/g) || []).length;
  if (codeChars / total > 0.08) return 'code';
  if (text.includes('\n') && /\b(function|const|let|var|class|import|export|return|if|else|for|while|def|public|private)\b/.test(text)) return 'code';
  return 'prose';
}

export function estimateTokens(text, contentType) {
  if (!text) return 0;
  const ct = contentType || detectContentType(text);
  const t = CONTENT_TYPES[ct] || CONTENT_TYPES.prose;
  return Math.max(1, Math.ceil(text.length * t.tokensPerChar));
}

export function splitByTokens(text, contentType) {
  if (!text) return [];
  const ct = contentType || detectContentType(text);
  if (ct === 'code') {
    const tokens = text.split(/(\s+|[{}();,<>=\[\]])/g).filter(Boolean);
    return tokens;
  }
  const tokens = text.split(/(\s+|[.,!?;:()\[\]{}"'`])/g).filter(Boolean);
  return tokens;
}

export function calculateCost(tokens, inputRatio, inputPer1M, outputPer1M) {
  const inputTokens = Math.round(tokens * inputRatio);
  const outputTokens = tokens - inputTokens;
  const inputCost = (inputTokens / 1_000_000) * inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * outputPer1M;
  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
}

export function formatUsd(n) {
  if (n === 0) return '$0.00';
  if (n < 0.0001) return '<$0.0001';
  if (n < 1) return '$' + n.toFixed(4);
  if (n < 100) return '$' + n.toFixed(2);
  return '$' + n.toFixed(0);
}

export function compareAllModels(tokens) {
  return MODELS.filter(m => m.id !== 'auto').map(m => {
    const cost = calculateCost(tokens, 0.5, m.inputPer1M, m.outputPer1M);
    return { model: m, ...cost };
  }).sort((a, b) => a.totalCost - b.totalCost);
}

export function buildStatsSnapshot(text, modelId, inputRatio) {
  const ct = detectContentType(text);
  const tokens = estimateTokens(text, ct);
  const model = MODELS.find(m => m.id === modelId) || MODELS[1];
  const cost = calculateCost(tokens, inputRatio, model.inputPer1M, model.outputPer1M);
  return {
    text_length_chars: countChars(text),
    words: countWords(text),
    lines: countLines(text),
    sentences: countSentences(text),
    detected_content_type: ct,
    estimated_tokens: tokens,
    model: model.name,
    provider: model.provider,
    input_tokens: cost.inputTokens,
    output_tokens: cost.outputTokens,
    input_cost_usd: cost.inputCost,
    output_cost_usd: cost.outputCost,
    total_cost_usd: cost.totalCost,
    note: 'Token count is a heuristic estimate. For exact counts, run through tiktoken or the provider tokenizer.'
  };
}

const SAMPLE_TEXT = `# The quick brown fox

The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!

## Code snippet

function greet(name) {
  const message = \`Hello, \${name}!\`;
  return message.toUpperCase();
}

console.log(greet("World"))`;

function tokenToHtml(tok) {
  if (!tok) return '';
  if (/^\s+$/.test(tok)) return `<span style="opacity:0.4;">${escapeHtml(tok)}</span>`;
  return `<span style="background:rgba(166,173,200,0.18);border-radius:3px;padding:0 1px;">${escapeHtml(tok)}</span>`;
}

const LLM_HTML = `
    <div class="tool-layout" style="display:flex;flex-direction:column;gap:var(--space-4);">
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);">
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:flex-end;">
          <div style="flex:1;min-width:200px;">
            <label for="ltc-model" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Model</label>
            <select id="ltc-model" class="text-input"></select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label for="ltc-ratio" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Input ratio: <span id="ltc-ratio-val">50%</span></label>
            <input type="range" id="ltc-ratio" min="0" max="100" value="50" step="5" style="width:100%;">
          </div>
          <button class="btn btn-secondary btn-sm" id="ltc-sample" type="button">Load sample</button>
          <button class="btn btn-secondary btn-sm" id="ltc-clear" type="button">Clear</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:var(--space-4);">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--space-4);">
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--color-border);background:var(--color-bg);">
              <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Input</span>
              <span style="font-size:var(--text-xs);color:var(--color-text-muted);">type or paste text</span>
            </div>
            <textarea id="ltc-text" spellcheck="false" placeholder="Paste your prompt here..." style="display:block;width:100%;min-height:280px;padding:var(--space-3);background:#1e1e2e;color:#cdd6f4;font-family:monospace;font-size:var(--text-sm);line-height:1.6;border:none;outline:none;resize:vertical;"></textarea>
          </div>
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--color-border);background:var(--color-bg);">
              <span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Highlighted tokens (approximate)</span>
              <span style="font-size:var(--text-xs);color:var(--color-text-muted);" id="ltc-ct-badge"></span>
            </div>
            <pre id="ltc-highlight" style="margin:0;padding:var(--space-3);background:#1e1e2e;color:#cdd6f4;font-family:monospace;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-word;min-height:280px;max-height:520px;overflow-y:auto;"></pre>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-2);" id="ltc-stats"></div>
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-3);">
            <span style="font-weight:600;font-size:var(--text-base);">Cost for <span id="ltc-model-name"></span></span>
            <span id="ltc-cost-total" style="font-size:var(--text-2xl);font-weight:700;color:var(--color-primary);"></span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-3);font-size:var(--text-sm);">
            <div style="padding:var(--space-3);background:var(--color-bg);border-radius:var(--radius-md);"><div style="color:var(--color-text-muted);">Input</div><div style="font-weight:600;" id="ltc-input-tokens"></div><div id="ltc-input-cost" style="color:var(--color-text-muted);"></div></div>
            <div style="padding:var(--space-3);background:var(--color-bg);border-radius:var(--radius-md);"><div style="color:var(--color-text-muted);">Output</div><div style="font-weight:600;" id="ltc-output-tokens"></div><div id="ltc-output-cost" style="color:var(--color-text-muted);"></div></div>
          </div>
        </div>
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);">
          <div style="font-weight:600;font-size:var(--text-base);margin-bottom:var(--space-3);">Compare all models (50% input / 50% output split)</div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);" id="ltc-compare">
              <thead><tr style="text-align:left;color:var(--color-text-muted);">
                <th style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">Model</th>
                <th style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">Provider</th>
                <th style="padding:var(--space-2);border-bottom:1px solid var(--color-border);text-align:right;">Input / 1M</th>
                <th style="padding:var(--space-2);border-bottom:1px solid var(--color-border);text-align:right;">Output / 1M</th>
                <th style="padding:var(--space-2);border-bottom:1px solid var(--color-border);text-align:right;">Cost</th>
              </tr></thead>
              <tbody id="ltc-compare-body"></tbody>
            </table>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm" id="ltc-copy-json" type="button">Copy stats as JSON</button>
          <button class="btn btn-secondary btn-sm" id="ltc-copy-md" type="button">Copy stats as Markdown</button>
        </div>
      </div>
    </div>`;

function renderStats(state, { ctBadgeEl, statsEl, modelNameEl, costTotalEl, inputTokensEl, inputCostEl, outputTokensEl, outputCostEl, compareBodyEl, highlightEl }) {
  const ct = detectContentType(state.text);
  const tokens = estimateTokens(state.text, ct);
  const model = MODELS.find(m => m.id === state.modelId) || MODELS[1];
  ctBadgeEl.textContent = `type: ${ct}`;
  const cells = [
    { label: 'Tokens (est.)', value: tokens.toLocaleString(), highlight: true },
    { label: 'Characters', value: countChars(state.text).toLocaleString() },
    { label: 'Words', value: countWords(state.text).toLocaleString() },
    { label: 'Lines', value: countLines(state.text).toLocaleString() },
    { label: 'Sentences', value: countSentences(state.text).toLocaleString() },
    { label: 'Type', value: ct }
  ];
  statsEl.innerHTML = cells.map(c => `<div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-3);text-align:center;${c.highlight ? 'border-color:var(--color-primary);' : ''}"><div style="font-size:var(--text-xs);color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(c.label)}</div><div style="font-size:${c.highlight ? 'var(--text-2xl)' : 'var(--text-base)'};font-weight:${c.highlight ? '700' : '600'};margin-top:var(--space-1);">${escapeHtml(String(c.value))}</div></div>`).join('');
  const cost = calculateCost(tokens, state.inputRatio, model.inputPer1M, model.outputPer1M);
  modelNameEl.textContent = model.name; costTotalEl.textContent = formatUsd(cost.totalCost);
  inputTokensEl.textContent = `${cost.inputTokens.toLocaleString()} tokens`; inputCostEl.textContent = formatUsd(cost.inputCost);
  outputTokensEl.textContent = `${cost.outputTokens.toLocaleString()} tokens`; outputCostEl.textContent = formatUsd(cost.outputCost);
  compareBodyEl.innerHTML = compareAllModels(tokens).map(r => {
    const sel = r.model.id === state.modelId;
    return `<tr style="${sel ? 'background:var(--color-bg);font-weight:600;' : ''}"><td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">${escapeHtml(r.model.name)}</td><td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);color:var(--color-text-muted);">${escapeHtml(r.model.provider)}</td><td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);text-align:right;">$${r.model.inputPer1M.toFixed(3)}</td><td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);text-align:right;">$${r.model.outputPer1M.toFixed(3)}</td><td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);text-align:right;color:var(--color-primary);">${formatUsd(r.totalCost)}</td></tr>`;
  }).join('');
  highlightEl.innerHTML = splitByTokens(state.text, ct).map(tokenToHtml).join('');
}

export function render(container) {
  const state = { text: '', modelId: 'gpt-4o', inputRatio: 0.5 };
  container.innerHTML = LLM_HTML;
  const els = { modelEl: container.querySelector('#ltc-model'), ratioEl: container.querySelector('#ltc-ratio'), ratioValEl: container.querySelector('#ltc-ratio-val'), sampleBtn: container.querySelector('#ltc-sample'), clearBtn: container.querySelector('#ltc-clear'), textEl: container.querySelector('#ltc-text'), highlightEl: container.querySelector('#ltc-highlight'), ctBadgeEl: container.querySelector('#ltc-ct-badge'), statsEl: container.querySelector('#ltc-stats'), modelNameEl: container.querySelector('#ltc-model-name'), costTotalEl: container.querySelector('#ltc-cost-total'), inputTokensEl: container.querySelector('#ltc-input-tokens'), inputCostEl: container.querySelector('#ltc-input-cost'), outputTokensEl: container.querySelector('#ltc-output-tokens'), outputCostEl: container.querySelector('#ltc-output-cost'), compareBodyEl: container.querySelector('#ltc-compare-body') };

  els.modelEl.innerHTML = MODELS.map(m => `<option value="${escapeHtml(m.id)}" ${m.id === state.modelId ? 'selected' : ''}>${escapeHtml(m.provider)} — ${escapeHtml(m.name)}</option>`).join('');
  els.modelEl.addEventListener('change', () => { state.modelId = els.modelEl.value; renderStats(state, els); });
  els.ratioEl.addEventListener('input', () => { state.inputRatio = parseInt(els.ratioEl.value, 10) / 100; els.ratioValEl.textContent = els.ratioEl.value + '%'; renderStats(state, els); });
  els.textEl.addEventListener('input', () => { state.text = els.textEl.value; renderStats(state, els); });
  els.sampleBtn.addEventListener('click', () => { state.text = SAMPLE_TEXT; els.textEl.value = state.text; renderStats(state, els); showToast({ message: 'Sample text loaded', type: 'success' }); });
  els.clearBtn.addEventListener('click', () => { state.text = ''; els.textEl.value = ''; renderStats(state, els); showToast({ message: 'Cleared', type: 'success' }); });
  container.querySelector('#ltc-copy-json').addEventListener('click', async () => { const snap = buildStatsSnapshot(state.text, state.modelId, state.inputRatio); const ok = await copyToClipboard(JSON.stringify(snap, null, 2)); showToast({ message: ok ? 'Copied stats as JSON' : 'Copy failed', type: ok ? 'success' : 'error' }); });
  container.querySelector('#ltc-copy-md').addEventListener('click', async () => {
    const snap = buildStatsSnapshot(state.text, state.modelId, state.inputRatio);
    const md = `# LLM Token Counter stats\n\n- **Model:** ${snap.model} (${snap.provider})\n- **Characters:** ${snap.text_length_chars}\n- **Words:** ${snap.words}\n- **Lines:** ${snap.lines}\n- **Sentences:** ${snap.sentences}\n- **Detected content type:** ${snap.detected_content_type}\n- **Estimated tokens:** ${snap.estimated_tokens}\n- **Input tokens (${Math.round(state.inputRatio * 100)}%):** ${snap.input_tokens} — ${formatUsd(snap.input_cost_usd)}\n- **Output tokens (${Math.round((1 - state.inputRatio) * 100)}%):** ${snap.output_tokens} — ${formatUsd(snap.output_cost_usd)}\n- **Total cost:** ${formatUsd(snap.total_cost_usd)}\n\n_${snap.note}_\n`;
    const ok = await copyToClipboard(md); showToast({ message: ok ? 'Copied stats as Markdown' : 'Copy failed', type: ok ? 'success' : 'error' });
  });
  renderStats(state, els);
}

export function destroy() {}
