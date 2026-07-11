export const toolConfig = {
  id: "chart-generator",
  name: "Chart Generator",
  category: "visualization",
  description: "Create bar, line, pie, doughnut, and radar charts from data.",
  icon: "📊",
  status: "done"
};

const CHART_CSS = `
    .chart-container { max-width: 800px; margin: 0 auto; }
    .chart-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .chart-controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { margin-bottom: var(--space-3); }
    .control-row select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row textarea { width: 100%; height: 120px; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); resize: vertical; font-family: monospace; font-size: var(--text-xs); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .chart-output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); min-height: 400px; }
    .chart-output canvas { width: 100%; height: 350px; }`;

const CHART_HTML = `
    <div class="chart-container">
      <h2>Chart Generator</h2>
      <div class="chart-controls">
        <div class="control-row"><select id="chartType"><option value="bar">Bar Chart</option><option value="line">Line Chart</option><option value="pie">Pie Chart</option><option value="doughnut">Doughnut Chart</option><option value="radar">Radar Chart</option></select></div>
        <div class="control-row"><textarea id="chartData" placeholder="Label, Value&#10;Jan, 30&#10;Feb, 45">Label, Value
Jan, 30
Feb, 45
Mar, 35
Apr, 50</textarea></div>
        <button id="generateBtn" class="generate-btn">Generate Chart</button>
      </div>
      <div class="chart-output"><canvas id="chart"></canvas></div>
    </div>`;

function drawBarChart(ctx, labels, values, width, height) {
  const max = Math.max(...values, 1),
    barWidth = Math.min(60, (width - 80) / labels.length - 10),
    scale = (height - 60) / max;
  labels.forEach((label, i) => {
    const barH = Math.max(5, values[i] * scale),
      x = 40 + i * (barWidth + 10),
      y = height - 40 - barH;
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(x, y, barWidth, barH);
    ctx.fillStyle = "#666";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + barWidth / 2, height - 20);
    ctx.fillText(values[i], x + barWidth / 2, y - 5);
  });
}

function drawLineChart(ctx, labels, values, width, height) {
  const max = Math.max(...values, 1),
    scale = (height - 60) / max,
    stepX = (width - 60) / Math.max(1, values.length - 1);
  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  values.forEach((val, i) => {
    const x = 30 + i * stepX,
      y = height - 40 - val * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  values.forEach((val, i) => {
    const x = 30 + i * stepX,
      y = height - 40 - val * scale;
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x, height - 20);
  });
}

function drawPieChart(ctx, labels, values, width, height, isDoughnut) {
  const total = values.reduce((a, b) => a + b, 0),
    colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16"
    ];
  let startAngle = -Math.PI / 2;
  const centerX = width / 2,
    centerY = height / 2,
    radius = Math.min(width, height) / 2 - 30,
    innerRadius = isDoughnut ? radius * 0.5 : 0;
  values.forEach((val, i) => {
    const sliceAngle = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    if (isDoughnut) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
    const midAngle = startAngle + sliceAngle / 2,
      labelR = radius + 15;
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      labels[i],
      centerX + labelR * Math.cos(midAngle),
      centerY + labelR * Math.sin(midAngle)
    );
    startAngle += sliceAngle;
  });
}

function drawRadarChart(ctx, labels, values, width, height) {
  const centerX = width / 2,
    centerY = height / 2,
    radius = Math.min(width, height) / 2 - 50,
    max = Math.max(...values, 1),
    angleStep = (Math.PI * 2) / labels.length,
    colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16"
    ];
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    const r = (radius / 5) * i;
    labels.forEach((_, j) => {
      const angle = -Math.PI / 2 + j * angleStep,
        x = centerX + r * Math.cos(angle),
        y = centerY + r * Math.sin(angle);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }
  labels.forEach((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    ctx.beginPath();
    ctx.strokeStyle = "#e5e7eb";
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.stroke();
  });
  ctx.beginPath();
  values.forEach((val, i) => {
    const angle = -Math.PI / 2 + i * angleStep,
      r = (val / max) * radius,
      x = centerX + r * Math.cos(angle),
      y = centerY + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.stroke();
  values.forEach((val, i) => {
    const angle = -Math.PI / 2 + i * angleStep,
      r = (val / max) * radius,
      x = centerX + r * Math.cos(angle),
      y = centerY + r * Math.sin(angle);
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const labelR = radius + 20;
    ctx.fillText(labels[i], centerX + labelR * Math.cos(angle), centerY + labelR * Math.sin(angle));
  });
}

const CHART_DRAWERS = { bar: drawBarChart, line: drawLineChart, radar: drawRadarChart };

function generateChart(container) {
  const type = container.querySelector("#chartType").value;
  const lines = container
    .querySelector("#chartData")
    .value.trim()
    .split("\n")
    .filter(l => l.trim());
  const labels = [],
    values = [];
  lines.forEach(line => {
    const [label, val] = line.split(",").map(s => s.trim());
    if (label && val) {
      labels.push(label);
      values.push(parseFloat(val) || 0);
    }
  });
  if (!labels.length) return;
  const canvas = container.querySelector("#chart"),
    ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 350;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (CHART_DRAWERS[type]) CHART_DRAWERS[type](ctx, labels, values, canvas.width, canvas.height);
  else drawPieChart(ctx, labels, values, canvas.width, canvas.height, type === "doughnut");
}

export function render(container) {
  container.innerHTML = CHART_HTML;
  const style = document.createElement("style");
  style.textContent = CHART_CSS;
  container.appendChild(style);
  container.querySelector("#generateBtn").addEventListener("click", () => generateChart(container));
  container.querySelector("#chartType").addEventListener("change", () => generateChart(container));
  generateChart(container);
}
