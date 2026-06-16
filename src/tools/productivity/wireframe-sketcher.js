import { escapeHtml } from '../../utils/escape-html.js';

export const toolConfig = {
  id: 'wireframe-sketcher',
  name: 'Wireframe & Mockup Sketcher',
  category: 'productivity',
  description: 'Quick wireframe and mockup sketcher with drag-and-drop shapes, text, and freehand drawing.',
  icon: '✏️',
  keywords: ['wireframe', 'mockup', 'sketch', 'draw', 'canvas', 'prototype'],
  accept: '',
  maxSizeMB: 0,
  status: 'done'
};

const SHAPES = [
  { id: 'rect', label: 'Rectangle', icon: '⬜' },
  { id: 'round', label: 'Rounded Box', icon: '🗃️' },
  { id: 'circle', label: 'Circle', icon: '⭕' },
  { id: 'line', label: 'Line', icon: '➖' },
  { id: 'arrow', label: 'Arrow', icon: '➡️' },
  { id: 'text', label: 'Text', icon: '📝' },
  { id: 'image', label: 'Image', icon: '🖼️' },
  { id: 'button', label: 'Button', icon: '🔘' },
  { id: 'input', label: 'Input', icon: '📝' },
  { id: 'header', label: 'Header', icon: '🔝' },
  { id: 'footer', label: 'Footer', icon: '🔻' },
  { id: 'nav', label: 'Nav', icon: '☰' }
];

export function render(container) {
  container.innerHTML = `
    <div class="ws-container">
      <div class="ws-toolbar">
        <div class="ws-shapes">
          ${SHAPES.map(s => `<button class="ws-shape" data-shape="${s.id}" title="${s.label}">${s.icon}</button>`).join('')}
        </div>
        <div class="ws-colors">
          <button class="ws-color active" data-color="#333" style="background:#333"></button>
          <button class="ws-color" data-color="#666" style="background:#666"></button>
          <button class="ws-color" data-color="#4285f4" style="background:#4285f4"></button>
          <button class="ws-color" data-color="#ea4335" style="background:#ea4335"></button>
          <button class="ws-color" data-color="#34a853" style="background:#34a853"></button>
          <button class="ws-color" data-color="#fbbc04" style="background:#fbbc04"></button>
          <button class="ws-color" data-color="#fff" style="background:#fff;border:1px solid #ccc"></button>
        </div>
        <div class="ws-actions">
          <button id="ws-clear" class="ws-btn">Clear</button>
          <button id="ws-download" class="ws-btn ws-btn-primary">Download</button>
        </div>
      </div>
      <canvas id="ws-canvas" class="ws-canvas"></canvas>
      <div class="ws-help">
        Click to add shapes • Drag to move • Resize via corners • Double-click to delete
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .ws-container { display: flex; flex-direction: column; height: 100%; }
    .ws-toolbar { display: flex; gap: var(--space-4); padding: var(--space-3); background: var(--color-surface); border-bottom: 2px solid var(--color-border); flex-wrap: wrap; align-items: center; }
    .ws-shapes { display: flex; gap: 4px; flex-wrap: wrap; }
    .ws-shape { width: 36px; height: 36px; border: 2px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); font-size: var(--text-lg); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .ws-shape:hover, .ws-shape.active { border-color: var(--color-primary); background: var(--color-primary-bg); }
    .ws-colors { display: flex; gap: 4px; padding-left: var(--space-3); border-left: 2px solid var(--color-border); }
    .ws-color { width: 24px; height: 24px; border: 2px solid transparent; border-radius: 50%; cursor: pointer; }
    .ws-color.active { border-color: var(--color-primary); transform: scale(1.2); }
    .ws-actions { display: flex; gap: var(--space-2); margin-left: auto; }
    .ws-btn { padding: var(--space-2) var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; font-weight: 600; }
    .ws-btn-primary { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .ws-canvas { flex: 1; background: #fff; cursor: crosshair; min-height: 400px; }
    .ws-help { text-align: center; padding: var(--space-2); font-size: var(--text-xs); color: var(--color-text-muted); background: var(--color-surface); }
  `;
  container.appendChild(style);

  const canvas = container.querySelector('#ws-canvas');
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(rect.width || 800, 800);
  canvas.height = Math.max(rect.height || 500, 500);

  let currentShape = 'rect';
  let currentColor = '#333';
  let elements = [];
  let selected = null;
  let dragging = false;
  let resizing = false;
  let dragStart = { x: 0, y: 0 };

  function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f5f5f5';
    for (let x = 0; x < canvas.width; x += 20) {
      for (let y = 0; y < canvas.height; y += 20) {
        if ((x + y) % 40 === 0) ctx.fillRect(x, y, 1, 1);
      }
    }
    elements.forEach(el => drawElement(el, el === selected));
  }

  function drawElement(el, highlight) {
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.color;
    ctx.lineWidth = highlight ? 3 : 2;
    if (highlight) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }

    if (el.type === 'rect') {
      ctx.strokeRect(el.x, el.y, el.w, el.h);
    } else if (el.type === 'round') {
      const r = Math.min(el.w, el.h) / 5;
      ctx.beginPath();
      ctx.roundRect(el.x, el.y, el.w, el.h, r);
      ctx.stroke();
    } else if (el.type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(el.x + el.w/2, el.y + el.h/2, Math.abs(el.w)/2, Math.abs(el.h)/2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'line' || el.type === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x + el.w, el.y + el.h);
      ctx.stroke();
      if (el.type === 'arrow') {
        const angle = Math.atan2(el.h, el.w);
        ctx.beginPath();
        ctx.moveTo(el.x + el.w, el.y + el.h);
        ctx.lineTo(el.x + el.w - 12 * Math.cos(angle - 0.5), el.y + el.h - 12 * Math.sin(angle - 0.5));
        ctx.lineTo(el.x + el.w - 12 * Math.cos(angle + 0.5), el.y + el.h - 12 * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();
      }
    } else if (el.type === 'text') {
      ctx.font = '16px sans-serif';
      ctx.fillText(el.text || 'Text', el.x, el.y + 16);
    } else if (el.type === 'button') {
      ctx.beginPath();
      ctx.roundRect(el.x, el.y, el.w, el.h, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(el.text || 'Button', el.x + el.w/2, el.y + el.h/2 + 5);
      ctx.textAlign = 'left';
    } else if (el.type === 'input') {
      ctx.beginPath();
      ctx.roundRect(el.x, el.y, el.w, el.h, 4);
      ctx.stroke();
    } else if (el.type === 'header') {
      ctx.fillRect(el.x, el.y, el.w, 50);
    } else if (el.type === 'footer') {
      ctx.fillRect(el.x, el.y + el.h - 50, el.w, 50);
    } else if (el.type === 'nav') {
      ctx.fillRect(el.x, el.y, el.w, el.h);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(el.x + 10 + i * 40, el.y + 15, 30, 3);
      }
    }
  }

  function hitTest(x, y) {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (x >= el.x && x <= el.x + el.w && y >= el.y && y <= el.y + el.h) return el;
    }
    return null;
  }

  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = hitTest(x, y);
    if (el) {
      selected = el;
      dragging = true;
      dragStart = { x: x - el.x, y: y - el.y };
    } else {
      selected = { type: currentShape, x: x - 50, y: y - 30, w: 100, h: 60, color: currentColor, text: currentShape === 'button' ? 'Button' : '' };
      elements.push(selected);
      dragging = true;
      dragStart = { x: 0, y: 0 };
    }
    draw();
  });

  canvas.addEventListener('mousemove', e => {
    if (dragging && selected) {
      const rect = canvas.getBoundingClientRect();
      selected.x = e.clientX - rect.left - dragStart.x;
      selected.y = e.clientY - rect.top - dragStart.y;
      draw();
    }
  });

  canvas.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mouseleave', () => { dragging = false; });

  canvas.addEventListener('dblclick', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = hitTest(x, y);
    if (el) {
      elements = elements.filter(item => item !== el);
      selected = null;
      draw();
    }
  });

  container.querySelectorAll('.ws-shape').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.ws-shape').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentShape = btn.dataset.shape;
    });
  });
  container.querySelector('[data-shape="rect"]').classList.add('active');

  container.querySelectorAll('.ws-color').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.ws-color').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = btn.dataset.color;
      if (selected) { selected.color = currentColor; draw(); }
    });
  });

  container.querySelector('#ws-clear').addEventListener('click', () => { elements = []; selected = null; draw(); });

  container.querySelector('#ws-download').addEventListener('click', () => {
    draw();
    const link = document.createElement('a');
    link.download = 'wireframe.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  draw();
}