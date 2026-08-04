import { showToast } from "../../components/toast.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "kanban-board",
  name: "Kanban Board",
  category: "productivity",
  description: "Drag-and-drop kanban board for task management.",
  icon: "📋",
  accept: "",
  maxSizeMB: 0,
  keywords: ["kanban", "board", "task", "drag", "project", "workflow"],
  steps: [
    "Click 'Add Card' to create a task",
    "Drag cards between columns to track progress",
    "Click a card title to rename it",
    "Edit a column name to rename it"
  ],
  faqs: [
    {
      question: "Is my board saved?",
      answer:
        "Yes. Your board is saved in your browser's localStorage on every change. Clear your browser data to erase it."
    },
    {
      question: "Can I move cards with my keyboard?",
      answer:
        "Yes. Use the move dropdown on each card to send it to another column without dragging."
    }
  ]
};

const STORAGE_KEY = "kanban_v1";

const DEFAULT_COLUMNS = [
  { id: "col-todo", title: "To Do", color: "#3B82F6" },
  { id: "col-progress", title: "In Progress", color: "#F59E0B" },
  { id: "col-done", title: "Done", color: "#10B981" }
];

const PALETTE = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDefaultBoard() {
  return {
    columns: DEFAULT_COLUMNS.map(col => ({
      id: col.id,
      title: col.title,
      color: col.color,
      cards: []
    }))
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.columns)) {
        const columns = parsed.columns
          .filter(col => col && typeof col === "object")
          .map(col => ({
            id: col.id || makeId("col"),
            title: col.title || "Untitled",
            color: col.color || PALETTE[0],
            cards: Array.isArray(col.cards)
              ? col.cards
                  .filter(card => card && typeof card === "object")
                  .map(card => ({
                    id: card.id || makeId("card"),
                    title: card.title || "Untitled",
                    description: card.description || ""
                  }))
              : []
          }));
        if (columns.length > 0 || parsed.columns.length === 0) return { columns };
      }
    }
  } catch {}
  return createDefaultBoard();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("Save failed:", e);
    return false;
  }
}

function persist(board) {
  if (!saveState(board)) {
    showToast({
      message: "Could not save your board. Browser storage may be unavailable.",
      type: "error"
    });
  }
}

export function findColumn(board, columnId) {
  return board.columns.find(col => col.id === columnId);
}

export function findCard(board, cardId) {
  for (const col of board.columns) {
    const card = col.cards.find(c => c.id === cardId);
    if (card) return { card, columnId: col.id };
  }
  return null;
}

export function addColumn(board, title) {
  const col = {
    id: makeId("col"),
    title: title || "New Column",
    color: PALETTE[board.columns.length % PALETTE.length],
    cards: []
  };
  board.columns.push(col);
  return col;
}

export function renameColumn(board, columnId, title) {
  const col = findColumn(board, columnId);
  const trimmed = title && title.trim();
  if (col && trimmed) col.title = trimmed;
}

export function setColumnColor(board, columnId, color) {
  const col = findColumn(board, columnId);
  if (col) col.color = color;
}

export function deleteColumn(board, columnId) {
  board.columns = board.columns.filter(col => col.id !== columnId);
}

export function addCard(board, columnId, title) {
  const col = findColumn(board, columnId);
  if (!col) return null;
  const card = {
    id: makeId("card"),
    title: title || "New Task",
    description: ""
  };
  col.cards.push(card);
  return card;
}

export function updateCard(board, columnId, cardId, patch) {
  const col = findColumn(board, columnId);
  if (!col) return;
  const card = col.cards.find(c => c.id === cardId);
  if (card) {
    if (patch.title !== undefined) card.title = patch.title;
    if (patch.description !== undefined) card.description = patch.description;
  }
}

export function deleteCard(board, columnId, cardId) {
  const col = findColumn(board, columnId);
  if (!col) return;
  col.cards = col.cards.filter(card => card.id !== cardId);
}

export function moveCard(board, cardId, targetColumnId, targetIndex) {
  const found = findCard(board, cardId);
  if (!found) return;
  const sourceCol = findColumn(board, found.columnId);
  const targetCol = findColumn(board, targetColumnId);
  if (!sourceCol || !targetCol) return;

  sourceCol.cards = sourceCol.cards.filter(card => card.id !== cardId);

  const card = found.card;
  const index = Math.max(0, Math.min(targetIndex, targetCol.cards.length));
  targetCol.cards.splice(index, 0, card);
}

export function adjustDropIndex(board, columnId, cardId, index) {
  const found = findCard(board, cardId);
  if (!found || found.columnId !== columnId) return index;
  const sourceIndex = findColumn(board, columnId).cards.indexOf(found.card);
  return sourceIndex >= 0 && sourceIndex < index ? index - 1 : index;
}

function columnCardCount(board, columnId) {
  const col = findColumn(board, columnId);
  return col ? col.cards.length : 0;
}

function renderColumn(board, col, root, callbacks) {
  const colEl = document.createElement("section");
  colEl.className = "kanban-column";
  colEl.dataset.columnId = col.id;
  colEl.style.setProperty("--col-accent", col.color);

  const count = columnCardCount(board, col.id);

  colEl.innerHTML = `
    <header class="kanban-col-header">
      <span class="kanban-col-dot" style="background:${col.color}"></span>
      <input class="kanban-col-title" value="${escapeHtml(col.title)}" aria-label="Column name" data-col-title name="column-title" />
      <span class="kanban-col-count" title="Card count">${count}</span>
      <div class="kanban-col-actions">
        <button class="btn btn-ghost btn-sm kanban-col-color" title="Change color" aria-label="Change column color">🎨</button>
        <button class="btn btn-ghost btn-sm kanban-col-delete" title="Delete column" aria-label="Delete column">🗑️</button>
      </div>
    </header>
    <div class="kanban-cards" data-cards></div>
    <button class="btn btn-secondary btn-sm kanban-add-card" aria-label="Add Card to ${escapeHtml(col.title)}">Add Card</button>
  `;

  const cardsEl = colEl.querySelector("[data-cards]");

  col.cards.forEach(card => {
    cardsEl.appendChild(renderCard(board, col.id, card, root, callbacks));
  });

  colEl.querySelector("[data-col-title]").addEventListener("change", e => {
    renameColumn(board, col.id, e.target.value);
    persist(board);
    renderBoard(board, root, callbacks);
  });

  colEl.querySelector(".kanban-col-color").addEventListener("click", () => {
    const idx = PALETTE.indexOf(col.color);
    const next = PALETTE[(idx + 1) % PALETTE.length];
    setColumnColor(board, col.id, next);
    persist(board);
    renderBoard(board, root, callbacks);
  });

  colEl.querySelector(".kanban-col-delete").addEventListener("click", () => {
    if (
      col.cards.length > 0 &&
      !confirm(`Delete "${col.title}" and its ${col.cards.length} card(s)?`)
    )
      return;
    deleteColumn(board, col.id);
    persist(board);
    renderBoard(board, root, callbacks);
  });

  colEl.querySelector(".kanban-add-card").addEventListener("click", () => {
    const card = addCard(board, col.id);
    persist(board);
    renderBoard(board, root, callbacks);
    requestAnimationFrame(() => {
      const freshCards = root.querySelector(`[data-column-id="${col.id}"] [data-cards]`);
      const cardEl = freshCards && freshCards.querySelector(`[data-card-id="${card.id}"]`);
      if (cardEl) {
        const titleInput = cardEl.querySelector("[data-card-title]");
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
      }
    });
  });

  const cards = cardsEl;
  cards.addEventListener("dragover", e => {
    if (!e.dataTransfer.types.includes("application/x-kanban-card")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    movePlaceholder(e, cards);
  });
  cards.addEventListener("dragleave", e => {
    if (cards.contains(e.relatedTarget)) return;
    cards.querySelector(".kanban-placeholder")?.remove();
  });
  cards.addEventListener("drop", e => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("application/x-kanban-card");
    const placeholder = cards.querySelector(".kanban-placeholder");
    const index = placeholder
      ? Array.from(cards.children).indexOf(placeholder)
      : cards.children.length;
    placeholder?.remove();
    if (!cardId) return;
    moveCard(board, cardId, col.id, adjustDropIndex(board, col.id, cardId, index));
    persist(board);
    renderBoard(board, root, callbacks);
  });

  return colEl;
}

function movePlaceholder(e, cardsEl) {
  const existing = cardsEl.querySelector(".kanban-placeholder");
  if (existing) {
    const rect = existing.getBoundingClientRect();
    if (rect.top <= e.clientY && rect.bottom >= e.clientY) return;
  }
  const realCards = Array.from(cardsEl.children).filter(
    el => !el.classList.contains("kanban-placeholder")
  );
  for (const cardEl of realCards) {
    if (cardEl.getBoundingClientRect().bottom >= e.clientY) {
      if (cardEl === existing) return;
      existing?.remove();
      cardsEl.insertBefore(placeholder(), cardEl);
      return;
    }
  }
  existing?.remove();
  cardsEl.appendChild(placeholder());

  function placeholder() {
    const el = document.createElement("div");
    el.className = "kanban-placeholder";
    return el;
  }
}

function renderCard(board, columnId, card, root, callbacks) {
  const cardEl = document.createElement("article");
  cardEl.className = "kanban-card";
  cardEl.draggable = true;
  cardEl.dataset.cardId = card.id;

  cardEl.innerHTML = `
    <input class="kanban-card-title" value="${escapeHtml(card.title)}" aria-label="Card title" data-card-title name="card-title" />
    ${card.description ? `<p class="kanban-card-desc" data-card-desc>${escapeHtml(card.description)}</p>` : ""}
    <div class="kanban-card-actions">
      <select class="kanban-move-select" aria-label="Move card to column" name="move-card">
        <option value="" selected disabled>Move to…</option>
        ${board.columns
          .filter(col => col.id !== columnId)
          .map(col => `<option value="${col.id}">→ ${escapeHtml(col.title)}</option>`)
          .join("")}
      </select>
      <button class="btn btn-ghost btn-sm kanban-card-desc-btn" title="Add / edit description" aria-label="Add or edit card description">📝</button>
      <button class="btn btn-ghost btn-sm kanban-card-delete" title="Delete card" aria-label="Delete card">✕</button>
    </div>
  `;

  const titleInput = cardEl.querySelector("[data-card-title]");
  titleInput.addEventListener("change", e => {
    updateCard(board, columnId, card.id, { title: e.target.value });
    persist(board);
    requestAnimationFrame(() => renderBoard(board, root, callbacks));
  });

  titleInput.addEventListener("click", e => {
    e.preventDefault();
    titleInput.focus();
  });

  titleInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleInput.blur();
    }
    if (e.key === " ") e.stopPropagation();
  });

  cardEl.querySelector(".kanban-move-select").addEventListener("change", e => {
    const targetColumnId = e.target.value;
    if (!targetColumnId) return;
    moveCard(board, card.id, targetColumnId, columnCardCount(board, targetColumnId));
    persist(board);
    renderBoard(board, root, callbacks);
  });

  cardEl.querySelector(".kanban-card-desc-btn").addEventListener("click", () => {
    if (cardEl.querySelector("[data-card-desc-input]")) return;
    const desc = cardEl.querySelector("[data-card-desc]");
    const textarea = document.createElement("textarea");
    textarea.className = "text-input kanban-card-desc-input";
    textarea.dataset.cardDescInput = "";
    textarea.value = card.description;
    textarea.setAttribute("aria-label", "Card description");
    textarea.setAttribute("name", "card-description");
    if (!desc) textarea.placeholder = "Add a description…";
    if (desc) desc.replaceWith(textarea);
    else cardEl.querySelector(".kanban-card-actions").before(textarea);
    textarea.focus();
    textarea.addEventListener("blur", () => {
      updateCard(board, columnId, card.id, { description: textarea.value });
      persist(board);
      requestAnimationFrame(() => renderBoard(board, root, callbacks));
    });
    textarea.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        textarea.blur();
      }
    });
  });

  cardEl.querySelector(".kanban-card-delete").addEventListener("click", () => {
    deleteCard(board, columnId, card.id);
    persist(board);
    renderBoard(board, root, callbacks);
  });

  cardEl.addEventListener("dragstart", e => {
    e.dataTransfer.setData("application/x-kanban-card", card.id);
    e.dataTransfer.effectAllowed = "move";
    cardEl.classList.add("kanban-dragging");
  });
  cardEl.addEventListener("dragend", () => {
    cardEl.classList.remove("kanban-dragging");
    document.querySelectorAll(".kanban-placeholder").forEach(el => el.remove());
  });

  return cardEl;
}

function renderBoard(board, root, callbacks) {
  const columnsEl = root.querySelector("[data-columns]");
  columnsEl.innerHTML = "";
  board.columns.forEach(col => {
    columnsEl.appendChild(renderColumn(board, col, root, callbacks));
  });
}

export function render(container) {
  const board = loadState();
  let boardRoot = null;

  container.innerHTML = `
    <div class="tool-container" data-kanban-root id="kanban-board-root">
      <div class="kanban-toolbar">
        <button class="btn btn-primary btn-sm" id="kanban-board-add-column">＋ Add Column</button>
        <button class="btn btn-secondary btn-sm" id="kanban-board-reset">Reset Board</button>
        <span class="kanban-tip">Drag cards between columns to move them. Click 🎨 to cycle column color.</span>
      </div>
      <div class="kanban-board" data-columns></div>
      <div class="kanban-privacy">🔒 All data is stored only on this device.</div>
    </div>
  `;

  boardRoot = container.querySelector("[data-kanban-root]");

  const style = document.createElement("style");
  style.textContent = `
    .kanban-toolbar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
    }
    .kanban-tip {
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
    }
    .kanban-board {
      display: flex;
      gap: var(--space-4);
      align-items: flex-start;
      overflow-x: auto;
      padding-bottom: var(--space-3);
    }
    .kanban-column {
      flex: 1 1 280px;
      min-width: 260px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      border-top: 3px solid var(--col-accent);
    }
    .kanban-col-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .kanban-col-dot {
      width: var(--space-2);
      height: var(--space-2);
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }
    .kanban-col-title {
      flex: 1;
      font-weight: 600;
      font-size: var(--text-base);
      border: 1px solid transparent;
      background: transparent;
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      min-width: 0;
    }
    .kanban-col-title:focus {
      border-color: var(--color-primary);
      background: var(--color-bg);
      outline: none;
    }
    .kanban-col-count {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-secondary);
      background: var(--color-bg);
      border-radius: var(--radius-full);
      padding: var(--space-1) var(--space-2);
    }
    .kanban-col-actions {
      display: flex;
      gap: var(--space-1);
    }
    .kanban-cards {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      min-height: var(--space-10);
    }
    .kanban-card {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-3);
      cursor: grab;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      box-shadow: var(--shadow-sm);
    }
    .kanban-card.kanban-dragging {
      opacity: 0.35;
    }
    .kanban-card:active {
      cursor: grabbing;
    }
    .kanban-card-title {
      border: 1px solid transparent;
      background: transparent;
      font-weight: 500;
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      width: 100%;
    }
    .kanban-card-title:focus {
      border-color: var(--color-primary);
      background: var(--color-bg);
      outline: none;
    }
    .kanban-card-desc {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .kanban-card-desc-input {
      width: 100%;
      min-height: var(--space-16);
      resize: vertical;
      font-size: var(--text-sm);
    }
    .kanban-card-actions {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    .kanban-move-select {
      flex: 1;
      font-size: var(--text-xs);
      padding: var(--space-1) var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-bg);
    }
    .kanban-placeholder {
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      min-height: var(--space-8);
      background: transparent;
    }
    .kanban-add-card {
      align-self: flex-start;
    }
    .kanban-privacy {
      margin-top: var(--space-3);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
    }
  `;
  container.appendChild(style);

  const columnsEl = container.querySelector("[data-columns]");

  renderBoard(board, boardRoot, {});

  container.querySelector("#kanban-board-add-column").addEventListener("click", () => {
    addColumn(board);
    persist(board);
    renderBoard(board, boardRoot, {});
  });

  container.querySelector("#kanban-board-reset").addEventListener("click", () => {
    if (!confirm("Reset the board to its default columns? This removes all your cards.")) return;
    const fresh = createDefaultBoard();
    board.columns = fresh.columns;
    persist(board);
    renderBoard(board, boardRoot, {});
    showToast({ message: "Board reset", type: "info" });
  });

  columnsEl.scrollLeft = 0;
}
