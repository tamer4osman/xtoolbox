const STORAGE_KEY = "decision-matrix-draft";
const MAX_OPTIONS = 8;
const MAX_CRITERIA = 10;
const DEFAULT_WEIGHT = 3;
const DEFAULT_SCORE = 3;

let uidCounter = 0;
function uid() {
  uidCounter += 1;
  return `dm${Date.now().toString(36)}${uidCounter}`;
}

export function createDraft() {
  return {
    title: "",
    criteria: [
      { id: uid(), name: "Cost", weight: DEFAULT_WEIGHT },
      { id: uid(), name: "Ease", weight: DEFAULT_WEIGHT }
    ],
    options: [
      { id: uid(), name: "Option A", scores: {} },
      { id: uid(), name: "Option B", scores: {} }
    ]
  };
}

export function computeRankings(draft) {
  const { criteria, options } = draft;
  const activeCriteria = criteria.filter(c => c.name.trim());
  return options
    .map(option => {
      let total = 0;
      let max = 0;
      let scored = false;
      for (const c of activeCriteria) {
        const raw = option.scores[c.id];
        const score = Number.isFinite(raw) ? Math.max(1, Math.min(5, raw)) : DEFAULT_SCORE;
        total += c.weight * score;
        max += c.weight * 5;
        scored = true;
      }
      const pct = scored && max > 0 ? Math.round((total / max) * 100) : 0;
      return { id: option.id, name: option.name.trim() || "Untitled", total, max, pct };
    })
    .sort((a, b) => b.total - a.total);
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.criteria) || !Array.isArray(parsed.options)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const toolConfig = {
  id: "decision-matrix",
  name: "Decision Matrix Maker",
  category: "productivity",
  description: "Create weighted decision matrices to compare options objectively.",
  icon: "⚖️",
  accept: null,
  maxSizeMB: null,
  keywords: ["decision", "matrix", "weight", "compare", "choose"],
  steps: [
    "List your options across the top",
    "Add criteria with importance weights",
    "Score each option 1-5 per criterion",
    "See the ranked winner update instantly"
  ],
  faqs: [
    {
      question: "How is the winner calculated?",
      answer:
        "Each score (1-5) is multiplied by its criterion's weight (1-5). The option with the highest weighted total wins."
    },
    {
      question: "Is my matrix saved?",
      answer:
        "Yes — your work autosaves in your browser's local storage and restores when you return. Nothing leaves your device."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>⚖️ ${toolConfig.name}</h1>
      <input type="text" id="dm-title" placeholder="Decision to make (optional)" maxlength="80">
      <div id="dm-table-wrap"></div>
      <div class="dm-actions">
        <button id="dm-add-criterion" class="btn btn-secondary">+ Criterion</button>
        <button id="dm-add-option" class="btn btn-secondary">+ Option</button>
        <button id="dm-reset" class="btn btn-danger">Reset</button>
      </div>
      <div id="dm-results" aria-live="polite"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #dm-title { width: 100%; padding: var(--space-2); margin: var(--space-3) 0; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .dm-grid { display: grid; gap: var(--space-1); align-items: center; margin: var(--space-3) 0; overflow-x: auto; }
    .dm-cell { padding: var(--space-1); }
    .dm-cell input[type=text] { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-weight: 600; }
    .dm-cell input[type=number] { width: 100%; padding: var(--space-1); border: 1px solid var(--color-border); border-radius: var(--radius-sm); text-align: center; }
    .dm-head { background: var(--color-surface); border-radius: var(--radius-md); padding: var(--space-2); }
    .dm-opt-head { display: flex; gap: var(--space-1); align-items: center; }
    .dm-opt-head input { flex: 1; }
    .dm-del { background: none; border: none; cursor: pointer; color: var(--color-text-muted, #999); font-size: var(--text-base); padding: var(--space-1); }
    .dm-del:hover { color: var(--color-danger, #d33); }
    .dm-weight-label { font-size: var(--text-xs); color: var(--color-text-muted, #888); text-align: center; display: block; }
    .dm-actions { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: var(--space-3) 0; }
    .dm-result-row { display: flex; align-items: center; gap: var(--space-3); margin: var(--space-2) 0; }
    .dm-result-name { min-width: 130px; font-weight: 600; }
    .dm-bar-track { flex: 1; height: 14px; background: var(--color-surface); border-radius: 7px; overflow: hidden; }
    .dm-bar-fill { height: 100%; background: var(--color-primary); transition: width 0.25s ease; }
    .dm-winner .dm-bar-fill { background: var(--color-success, #2a2); }
    .dm-pct { min-width: 90px; text-align: right; font-variant-numeric: tabular-nums; }
    @media (max-width: 600px) { .dm-result-name { min-width: 90px; } }
  `;
  container.appendChild(style);

  let draft = loadDraft() || createDraft();
  const tableWrap = container.querySelector("#dm-table-wrap");
  const resultsEl = container.querySelector("#dm-results");
  const titleInput = container.querySelector("#dm-title");

  titleInput.value = draft.title || "";

  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        /* storage unavailable */
      }
    }, 400);
  }

  function readDraftFromDom() {
    draft.title = titleInput.value;
    tableWrap.querySelectorAll("[data-kind]").forEach(el => {
      const kind = el.dataset.kind;
      const idx = Number(el.dataset.idx);
      if (kind === "crit-name") draft.criteria[idx].name = el.value;
      else if (kind === "crit-weight") draft.criteria[idx].weight = Number(el.value);
      else if (kind === "opt-name") draft.options[idx].name = el.value;
      else if (kind === "opt-score")
        draft.options[Number(el.dataset.opt)].scores[draft.criteria[idx].id] = Number(el.value);
    });
  }

  function renderTable() {
    if (draft.criteria.length === 0 || draft.options.length === 0) {
      tableWrap.innerHTML = `<p class="ng-empty">Add at least one criterion and one option.</p>`;
      return;
    }
    const attr = s => String(s).replace(/"/g, "&quot;");
    const cols = draft.options.length;
    tableWrap.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "dm-grid";
    grid.style.gridTemplateColumns = `minmax(140px, 1fr) repeat(${cols}, minmax(110px, 1fr))`;

    const corner = document.createElement("div");
    corner.className = "dm-cell dm-head";
    corner.textContent = "Criteria ↓ / Options →";
    grid.appendChild(corner);

    draft.options.forEach((o, i) => {
      const cell = document.createElement("div");
      cell.className = "dm-cell dm-head dm-opt-head";
      cell.innerHTML = `<input type="text" data-kind="opt-name" data-idx="${i}" value="${attr(o.name)}" placeholder="Option ${i + 1}" aria-label="Option ${i + 1} name"><button type="button" class="dm-del" data-del-opt="${i}" title="Remove option" aria-label="Remove option ${i + 1}">✕</button>`;
      grid.appendChild(cell);
    });

    draft.criteria.forEach((c, ci) => {
      const nameCell = document.createElement("div");
      nameCell.className = "dm-cell";
      nameCell.innerHTML = `<input type="text" data-kind="crit-name" data-idx="${ci}" value="${attr(c.name)}" placeholder="Criterion ${ci + 1}" aria-label="Criterion ${ci + 1} name"><span class="dm-weight-label">Weight</span><input type="number" data-kind="crit-weight" data-idx="${ci}" value="${c.weight}" min="1" max="5" aria-label="Weight for criterion ${ci + 1}">`;
      grid.appendChild(nameCell);

      draft.options.forEach((o, oi) => {
        const score = o.scores[c.id];
        const cell = document.createElement("div");
        cell.className = "dm-cell";
        cell.innerHTML = `<input type="number" data-kind="opt-score" data-idx="${ci}" data-opt="${oi}" value="${Number.isFinite(score) ? score : DEFAULT_SCORE}" min="1" max="5" aria-label="Score option ${oi + 1} on criterion ${ci + 1}">`;
        grid.appendChild(cell);
      });
    });

    tableWrap.appendChild(grid);
  }

  function renderResults() {
    const rankings = computeRankings(draft);
    if (!rankings.length) {
      resultsEl.innerHTML = "";
      return;
    }
    const top = rankings[0].total;
    resultsEl.innerHTML =
      `<h2>Result</h2>` +
      rankings
        .map(
          (r, i) => `
        <div class="dm-result-row ${r.total === top ? "dm-winner" : ""}">
          <span class="dm-result-name">${i === 0 ? "🏆 " : `${i + 1}. `}${r.name}</span>
          <div class="dm-bar-track"><div class="dm-bar-fill" style="width:${r.pct}%"></div></div>
          <span class="dm-pct">${r.total}/${r.max}</span>
        </div>`
        )
        .join("");
  }

  function refresh() {
    renderTable();
    renderResults();
  }

  container.addEventListener("input", e => {
    if (!e.target.closest("#dm-table-wrap") && e.target !== titleInput) return;
    readDraftFromDom();
    renderResults();
    scheduleSave();
  });

  tableWrap.addEventListener("change", () => {
    scheduleSave();
  });

  container.querySelector("#dm-add-criterion").addEventListener("click", () => {
    readDraftFromDom();
    if (draft.criteria.length >= MAX_CRITERIA) return;
    draft.criteria.push({
      id: uid(),
      name: `Criterion ${draft.criteria.length + 1}`,
      weight: DEFAULT_WEIGHT
    });
    refresh();
    scheduleSave();
  });

  container.querySelector("#dm-add-option").addEventListener("click", () => {
    readDraftFromDom();
    if (draft.options.length >= MAX_OPTIONS) return;
    draft.options.push({
      id: uid(),
      name: `Option ${String.fromCharCode(65 + draft.options.length)}`,
      scores: {}
    });
    refresh();
    scheduleSave();
  });

  tableWrap.addEventListener("click", e => {
    const delCrit = e.target.closest("[data-del-crit]");
    const delOpt = e.target.closest("[data-del-opt]");
    if (!delCrit && !delOpt) return;
    readDraftFromDom();
    if (delCrit && draft.criteria.length > 1)
      draft.criteria.splice(Number(delCrit.dataset.delCrit), 1);
    if (delOpt && draft.options.length > 1) draft.options.splice(Number(delOpt.dataset.delOpt), 1);
    refresh();
    scheduleSave();
  });

  container.querySelector("#dm-reset").addEventListener("click", () => {
    draft = createDraft();
    titleInput.value = "";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    refresh();
  });

  refresh();
}
