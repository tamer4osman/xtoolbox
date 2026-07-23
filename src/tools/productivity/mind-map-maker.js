export const toolConfig = {
  id: "mind-map-maker",
  name: "Mind Map Maker",
  category: "productivity",
  description: "Create visual mind maps with drag-and-drop nodes.",
  icon: "🧠",
  accept: null,
  maxSizeMB: null,
  keywords: ["mind", "map", "brainstorm", "visual", "organize", "diagram"],
  steps: [
    "Click a node to select it",
    "Add child nodes from the toolbar",
    "Drag nodes to rearrange",
    "Double-click to rename"
  ],
  faqs: [
    {
      question: "How do I add a new node?",
      answer:
        "Click a node to select it, then click 'Add Child' in the toolbar. The new node appears below the selected one."
    },
    {
      question: "How do I rename a node?",
      answer: "Double-click any node to rename it via a prompt dialog."
    },
    {
      question: "Is my mind map saved?",
      answer:
        "Yes. Your mind map is saved in your browser's localStorage. Clear your browser data to erase it."
    }
  ]
};

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#6B7280"
];

const STORAGE_KEY = "mmm_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    nodes: [
      {
        id: "root",
        x: 400,
        y: 300,
        text: "Central Idea",
        color: "#3B82F6",
        parentId: null
      }
    ]
  };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function findNodeById(nodes, id) {
  return nodes.find(n => n.id === id);
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function renderMindMap(svg, nodes, selectedId) {
  svg.innerHTML = "";

  for (const node of nodes) {
    if (node.parentId) {
      const parent = findNodeById(nodes, node.parentId);
      if (parent) {
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", parent.x);
        line.setAttribute("y1", parent.y);
        line.setAttribute("x2", node.x);
        line.setAttribute("y2", node.y);
        line.setAttribute("stroke", "#CBD5E1");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
      }
    }
  }

  for (const node of nodes) {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("data-node-id", node.id);
    g.style.cursor = "grab";

    const textWidth = Math.max(80, node.text.length * 8 + 20);

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", node.x - textWidth / 2);
    rect.setAttribute("y", node.y - 18);
    rect.setAttribute("width", textWidth);
    rect.setAttribute("height", 36);
    rect.setAttribute("rx", 8);
    rect.setAttribute("fill", node.color || "#3B82F6");
    if (node.id === selectedId) {
      rect.setAttribute("stroke", "#1E293B");
      rect.setAttribute("stroke-width", "2");
      rect.setAttribute("stroke-dasharray", "4 2");
    }
    g.appendChild(rect);

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", node.x);
    text.setAttribute("y", node.y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "13");
    text.setAttribute("font-family", "sans-serif");
    text.textContent = node.text;
    g.appendChild(text);

    svg.appendChild(g);
  }
}

export function render(container) {
  const state = loadState();
  let selectedId = state.nodes.length > 0 ? state.nodes[0].id : null;

  container.innerHTML = `
    <div class="tool-container">
      <div class="tool-header">
        <h1>${toolConfig.name}</h1>
        <p class="tool-description">${toolConfig.description}</p>
      </div>
      <div class="mmm-toolbar">
        <button id="mmm-add-child" class="btn btn-primary btn-sm">Add Child</button>
        <button id="mmm-delete" class="btn btn-secondary btn-sm">Delete</button>
        <span class="mmm-separator"></span>
        <div id="mmm-colors" class="mmm-colors"></div>
        <span class="mmm-separator"></span>
        <button id="mmm-export-png" class="btn btn-secondary btn-sm">Export PNG</button>
        <button id="mmm-export-svg" class="btn btn-secondary btn-sm">Export SVG</button>
        <button id="mmm-clear" class="btn btn-secondary btn-sm">Clear All</button>
      </div>
      <div class="mmm-canvas-wrap">
        <svg id="mmm-svg" class="mmm-svg" width="100%" height="500"></svg>
      </div>
      <div class="mmm-privacy">🔒 All data is stored only on this device.</div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .mmm-toolbar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
    }
    .mmm-separator {
      width: 1px;
      height: 24px;
      background: var(--color-border);
      margin: 0 var(--space-1);
    }
    .mmm-colors {
      display: flex;
      gap: 4px;
    }
    .mmm-color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      padding: 0;
    }
    .mmm-color-swatch.mmm-active {
      border-color: var(--color-text-primary, #1E293B);
      box-shadow: 0 0 0 2px var(--color-surface, #fff);
    }
    .mmm-canvas-wrap {
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      overflow: hidden;
      background: var(--color-background-primary, #fff);
      margin-bottom: var(--space-3);
    }
    .mmm-svg {
      display: block;
      user-select: none;
      touch-action: none;
    }
    .mmm-privacy {
      font-size: var(--text-xs);
      color: var(--color-text-secondary, #6b7280);
    }
  `;
  container.appendChild(style);

  const svg = container.querySelector("#mmm-svg");
  const colorsDiv = container.querySelector("#mmm-colors");

  COLORS.forEach(color => {
    const btn = document.createElement("button");
    btn.className = "mmm-color-swatch";
    btn.style.background = color;
    btn.setAttribute("data-color", color);
    btn.addEventListener("click", () => {
      if (!selectedId) return;
      const node = findNodeById(state.nodes, selectedId);
      if (node) {
        node.color = color;
        saveState(state);
        renderMindMap(svg, state.nodes, selectedId);
        updateColorSelection(color);
      }
    });
    colorsDiv.appendChild(btn);
  });

  function updateColorSelection(activeColor) {
    colorsDiv.querySelectorAll(".mmm-color-swatch").forEach(btn => {
      btn.classList.toggle("mmm-active", btn.getAttribute("data-color") === activeColor);
    });
  }

  container.querySelector("#mmm-add-child").addEventListener("click", () => {
    if (!selectedId) return;
    const parent = findNodeById(state.nodes, selectedId);
    if (!parent) return;

    const childCount = state.nodes.filter(n => n.parentId === parent.id).length;
    const angle = ((childCount * 45) % 360) * (Math.PI / 180);
    const dist = 150;

    const newNode = {
      id: crypto.randomUUID(),
      x: parent.x + Math.cos(angle) * dist,
      y: parent.y + Math.sin(angle) * dist,
      text: "New Idea",
      color: parent.color || "#3B82F6",
      parentId: parent.id
    };

    state.nodes.push(newNode);
    selectedId = newNode.id;
    saveState(state);
    renderMindMap(svg, state.nodes, selectedId);
    updateColorSelection(newNode.color);
  });

  container.querySelector("#mmm-delete").addEventListener("click", () => {
    if (!selectedId || selectedId === "root") return;
    const descendants = getDescendants(state.nodes, selectedId);
    const toRemove = new Set([selectedId, ...descendants.map(n => n.id)]);
    state.nodes = state.nodes.filter(n => !toRemove.has(n.id));
    selectedId = state.nodes.length > 0 ? state.nodes[0].id : null;
    saveState(state);
    renderMindMap(svg, state.nodes, selectedId);
  });

  container.querySelector("#mmm-clear").addEventListener("click", () => {
    if (!confirm("Clear all nodes? This cannot be undone.")) return;
    state.nodes = [
      {
        id: "root",
        x: 400,
        y: 300,
        text: "Central Idea",
        color: "#3B82F6",
        parentId: null
      }
    ];
    selectedId = "root";
    saveState(state);
    renderMindMap(svg, state.nodes, selectedId);
    updateColorSelection("#3B82F6");
  });

  container.querySelector("#mmm-export-png").addEventListener("click", () => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("width", "1200");
    clone.setAttribute("height", "800");
    const data = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1200, 800);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mind-map.png";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
  });

  container.querySelector("#mmm-export-svg").addEventListener("click", () => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", SVG_NS);
    const data = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mind-map.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  let dragging = null;
  let offsetX = 0;
  let offsetY = 0;

  svg.addEventListener("pointerdown", e => {
    const g = e.target.closest("[data-node-id]");
    if (!g) return;
    const id = g.getAttribute("data-node-id");
    dragging = findNodeById(state.nodes, id);
    if (!dragging) return;
    selectedId = id;
    const rect = svg.getBoundingClientRect();
    offsetX = e.clientX - rect.left - dragging.x;
    offsetY = e.clientY - rect.top - dragging.y;
    renderMindMap(svg, state.nodes, selectedId);
    updateColorSelection(dragging.color);
    svg.setPointerCapture(e.pointerId);
  });

  svg.addEventListener("pointermove", e => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    dragging.x = e.clientX - rect.left - offsetX;
    dragging.y = e.clientY - rect.top - offsetY;
    renderMindMap(svg, state.nodes, selectedId);
  });

  svg.addEventListener("pointerup", () => {
    if (dragging) {
      saveState(state);
      dragging = null;
    }
  });

  svg.addEventListener("dblclick", e => {
    const g = e.target.closest("[data-node-id]");
    if (!g) return;
    const id = g.getAttribute("data-node-id");
    const node = findNodeById(state.nodes, id);
    if (!node) return;
    const newName = prompt("Rename node:", node.text);
    if (newName !== null && newName.trim() !== "") {
      node.text = newName.trim();
      saveState(state);
      renderMindMap(svg, state.nodes, selectedId);
    }
  });

  renderMindMap(svg, state.nodes, selectedId);
  if (state.nodes.length > 0) {
    updateColorSelection(state.nodes[0].color);
  }
}

function getDescendants(nodes, nodeId) {
  const result = [];
  for (const node of nodes) {
    if (node.parentId === nodeId) {
      result.push(node);
      result.push(...getDescendants(nodes, node.id));
    }
  }
  return result;
}
