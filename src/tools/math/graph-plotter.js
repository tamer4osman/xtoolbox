export const toolConfig = {
  id: "graph-plotter",
  name: "Graph Plotter",
  category: "math",
  description: "Plot mathematical functions with zoom and pan.",
  icon: "📈",
  status: "done"
};

export function render(container) {
  container.innerHTML = `
    <div class="graph-container">
      <div class="graph-form">
        <div class="form-group">
          <label>Function (use x as variable)</label>
          <input type="text" id="function" placeholder="e.g., Math.sin(x), x*x, Math.sqrt(x)" value="Math.sin(x)" />
          <small>JavaScript Math functions: sin, cos, tan, sqrt, pow, log, abs, PI</small>
        </div>
        <div class="range-inputs">
          <div class="form-group">
            <label>X Min</label>
            <input type="number" id="xmin" value="-10" />
          </div>
          <div class="form-group">
            <label>X Max</label>
            <input type="number" id="xmax" value="10" />
          </div>
        </div>
        <button id="plot-btn" class="plot-button">Plot Graph</button>
      </div>
      <canvas id="graph-canvas" width="600" height="400"></canvas>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .graph-container { max-width: 700px; margin: 0 auto; }
    .graph-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .graph-form { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .form-group { margin-bottom: var(--space-3); }
    .form-group label { display: block; margin-bottom: var(--space-1); font-weight: 500; font-size: var(--text-sm); }
    .form-group input { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .form-group small { font-size: var(--text-xs); color: var(--color-text-muted); }
    .range-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
    .plot-button { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    #graph-canvas { width: 100%; border-radius: var(--radius-lg); background: white; }
  `;
  container.appendChild(style);

  function plot() {
    const canvas = container.querySelector("#graph-canvas");
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const xMin = parseFloat(container.querySelector("#xmin").value) || -10;
    const xMax = parseFloat(container.querySelector("#xmax").value) || 10;
    const yMin = -10;
    const yMax = 10;

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const toCanvasX = x => ((x - xMin) / xRange) * width;
    const toCanvasY = y => height - ((y - yMin) / yRange) * height;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let i = Math.ceil(xMin); i <= xMax; i++) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(i), 0);
      ctx.lineTo(toCanvasX(i), height);
      ctx.stroke();
    }
    for (let i = Math.ceil(yMin); i <= yMax; i++) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(i));
      ctx.lineTo(width, toCanvasY(i));
      ctx.stroke();
    }

    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();

    try {
      const func = new Function("x", "return " + container.querySelector("#function").value);
      let first = true;

      for (let px = 0; px < width; px++) {
        const x = xMin + (px / width) * xRange;
        try {
          const y = func(x);
          if (isFinite(y)) {
            const cy = toCanvasY(y);
            if (first) {
              ctx.moveTo(px, cy);
              first = false;
            } else ctx.lineTo(px, cy);
          }
        } catch (e) {}
      }
      ctx.stroke();
    } catch (e) {
      ctx.fillStyle = "red";
      ctx.font = "14px sans-serif";
      ctx.fillText("Invalid function", 10, 20);
    }

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  container.querySelector("#plot-btn").addEventListener("click", plot);
  plot();
}
