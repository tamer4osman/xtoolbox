export function render(container) {
  container.innerHTML = `
    <div class="chart-container">
      <h2>Chart Generator</h2>
      <div class="chart-controls">
        <div class="control-row">
          <select id="chartType">
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="doughnut">Doughnut Chart</option>
            <option value="radar">Radar Chart</option>
          </select>
        </div>
        <div class="control-row">
          <textarea id="chartData" placeholder="Label, Value&#10;Jan, 30&#10;Feb, 45">Label, Value
Jan, 30
Feb, 45
Mar, 35
Apr, 50</textarea>
        </div>
        <button id="generateBtn" class="generate-btn">Generate Chart</button>
      </div>
      <div class="chart-output"><canvas id="chart"></canvas></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .chart-container { max-width: 800px; margin: 0 auto; }
    .chart-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .chart-controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-row { margin-bottom: var(--space-3); }
    .control-row select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .control-row textarea { width: 100%; height: 120px; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); resize: vertical; font-family: monospace; font-size: var(--text-xs); }
    .generate-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; }
    .chart-output { background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-4); min-height: 400px; }
    .chart-output canvas { width: 100%; height: 350px; }
  `;
  container.appendChild(style);

  function drawBarChart(ctx, labels, values, width, height) {
    const max = Math.max(...values, 1);
    const barWidth = Math.min(60, (width - 80) / labels.length - 10);
    const scale = (height - 60) / max;
    labels.forEach((label, i) => {
      const barHeight = Math.max(5, values[i] * scale);
      const x = 40 + i * (barWidth + 10);
      const y = height - 40 - barHeight;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.fillStyle = '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + barWidth/2, height - 20);
      ctx.fillText(values[i], x + barWidth/2, y - 5);
    });
  }

  function drawLineChart(ctx, labels, values, width, height) {
    const max = Math.max(...values, 1);
    const scale = (height - 60) / max;
    const stepX = (width - 60) / Math.max(1, values.length - 1);
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    values.forEach((val, i) => {
      const x = 30 + i * stepX;
      const y = height - 40 - val * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    values.forEach((val, i) => {
      const x = 30 + i * stepX;
      const y = height - 40 - val * scale;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x, height - 20);
    });
  }

  function drawPieChart(ctx, labels, values, width, height, isDoughnut) {
    const total = values.reduce((a, b) => a + b, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    let startAngle = -Math.PI / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    const innerRadius = isDoughnut ? radius * 0.5 : 0;
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
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = radius + 15;
      const labelX = centerX + labelR * Math.cos(midAngle);
      const labelY = centerY + labelR * Math.sin(midAngle);
      ctx.fillStyle = '#666';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], labelX, labelY);
      startAngle += sliceAngle;
    });
  }

  function drawRadarChart(ctx, labels, values, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50;
    const max = Math.max(...values, 1);
    const angleStep = (Math.PI * 2) / labels.length;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const r = (radius / 5) * i;
      labels.forEach((_, j) => {
        const angle = -Math.PI / 2 + j * angleStep;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    
    labels.forEach((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      ctx.beginPath();
      ctx.strokeStyle = '#e5e7eb';
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
      ctx.stroke();
    });
    
    ctx.beginPath();
    values.forEach((val, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (val / max) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    values.forEach((val, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (val / max) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      const labelR = radius + 20;
      const labelX = centerX + labelR * Math.cos(angle);
      const labelY = centerY + labelR * Math.sin(angle);
      ctx.fillText(labels[i], labelX, labelY);
    });
  }

  function generateChart() {
    const type = container.querySelector('#chartType').value;
    const dataText = container.querySelector('#chartData').value.trim();
    const lines = dataText.split('\n').filter(l => l.trim());
    const labels = [], values = [];
    lines.forEach(line => {
      const [label, val] = line.split(',').map(s => s.trim());
      if (label && val) { labels.push(label); values.push(parseFloat(val) || 0); }
    });
    if (!labels.length) return;
    const canvas = container.querySelector('#chart');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 600;
    canvas.height = 350;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (type === 'bar') drawBarChart(ctx, labels, values, canvas.width, canvas.height);
    else if (type === 'line') drawLineChart(ctx, labels, values, canvas.width, canvas.height);
    else if (type === 'radar') drawRadarChart(ctx, labels, values, canvas.width, canvas.height);
    else drawPieChart(ctx, labels, values, canvas.width, canvas.height, type === 'doughnut');
  }

  container.querySelector('#generateBtn').addEventListener('click', generateChart);
  container.querySelector('#chartType').addEventListener('change', generateChart);
  generateChart();
}
