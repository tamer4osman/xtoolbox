export function setupCanvas(canvas, bgColor) {
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let tool = "pen";
  let color = "#000000";
  let size = 3;

  function resize() {
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function move(e) {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    ctx.strokeStyle = tool === "eraser" ? bgColor : color;
    ctx.lineWidth = tool === "eraser" ? size * 5 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function stop(e) {
    e.preventDefault();
    drawing = false;
    ctx.beginPath();
  }

  resize();
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mouseleave", stop);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", stop, { passive: false });

  return {
    setColor(c) {
      color = c;
      tool = "pen";
    },
    setSize(s) {
      size = s;
    },
    setTool(t) {
      tool = t;
    },
    clear() {
      resize();
    },
    resize,
    getCtx() {
      return ctx;
    }
  };
}

export const toolConfig = {
  id: "drawing-pad",
  name: "Drawing Pad",
  category: "productivity",
  description:
    "Freehand drawing canvas. Draw, erase, change colors and brush sizes, and export as PNG.",
  icon: "✏️",
  accept: null,
  maxSizeMB: null,
  keywords: ["drawing", "draw", "sketch", "canvas", "freehand", "painting", "whiteboard"],
  steps: [
    "Select brush color and size",
    "Draw on the canvas",
    "Export as PNG or clear to start over"
  ],
  faqs: [
    {
      question: "Can I undo strokes?",
      answer: "Not yet — clear the canvas and try again, or export frequent saves."
    },
    {
      question: "Does it work on touch devices?",
      answer: "Yes! Drawing Pad works with mouse and touch input."
    }
  ]
};

export function render(container) {
  container.innerHTML = `
    <div class="tool-layout">
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-3);align-items:center;">
        <div class="form-group" style="margin-bottom:0;flex-direction:row;align-items:center;gap:var(--space-2);">
          <label style="margin-bottom:0;white-space:nowrap;">Color</label>
          <input type="color" id="dp-color" class="text-input" value="#000000" style="width:48px;height:40px;padding:2px;">
        </div>
        <div class="form-group" style="margin-bottom:0;flex-direction:row;align-items:center;gap:var(--space-2);">
          <label style="margin-bottom:0;white-space:nowrap;">Size</label>
          <input type="range" id="dp-size" min="1" max="30" value="3" style="width:100px;">
          <span id="dp-size-label" style="font-size:var(--text-sm);min-width:24px;">3</span>
        </div>
        <button class="btn btn-secondary" id="dp-eraser">Eraser</button>
        <button class="btn btn-secondary" id="dp-pen" style="display:none;">Pen</button>
        <button class="btn btn-secondary" id="dp-clear">Clear</button>
        <button class="btn btn-primary" id="dp-export">Export PNG</button>
      </div>
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;cursor:crosshair;">
        <canvas id="dp-canvas" style="width:100%;height:500px;display:block;touch-action:none;"></canvas>
      </div>
    </div>
  `;

  const canvas = container.querySelector("#dp-canvas");
  const ctrl = setupCanvas(canvas, "#ffffff");

  container.querySelector("#dp-color").addEventListener("input", e => {
    ctrl.setColor(e.target.value);
  });

  container.querySelector("#dp-size").addEventListener("input", e => {
    const v = parseInt(e.target.value);
    ctrl.setSize(v);
    container.querySelector("#dp-size-label").textContent = v;
  });

  container.querySelector("#dp-eraser").addEventListener("click", () => {
    ctrl.setTool("eraser");
    container.querySelector("#dp-eraser").style.display = "none";
    container.querySelector("#dp-pen").style.display = "";
  });

  container.querySelector("#dp-pen").addEventListener("click", () => {
    ctrl.setTool("pen");
    container.querySelector("#dp-eraser").style.display = "";
    container.querySelector("#dp-pen").style.display = "none";
  });

  container.querySelector("#dp-clear").addEventListener("click", () => {
    ctrl.clear();
  });

  container.querySelector("#dp-export").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  const ro = new ResizeObserver(() => ctrl.resize());
  ro.observe(canvas);
}

export function destroy() {}
