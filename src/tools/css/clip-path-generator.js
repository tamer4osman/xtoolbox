export function render(container) {
  container.innerHTML = `
    <div class="clip-container">
      <div class="preview-box" id="preview"></div>
      <div class="controls">
        <div class="control-group">
          <label>Shape</label>
          <select id="shape">
            <option value="polygon">Polygon</option>
            <option value="circle">Circle</option>
            <option value="ellipse">Ellipse</option>
            <option value="inset">Inset</option>
          </select>
        </div>
        <div class="polygon-inputs" id="polygonInputs">
          <div class="point"><input type="number" id="p1x" value="0"><input type="number" id="p1y" value="0"></div>
          <div class="point"><input type="number" id="p2x" value="100"><input type="number" id="p2y" value="0"></div>
          <div class="point"><input type="number" id="p3x" value="100"><input type="number" id="p3y" value="100"></div>
          <div class="point"><input type="number" id="p4x" value="0"><input type="number" id="p4y" value="100"></div>
        </div>
        <div class="circle-inputs" id="circleInputs" style="display:none">
          <div class="control-row"><label>Radius %</label><input type="range" id="radius" value="50" min="0" max="100"><span id="radiusVal">50%</span></div>
          <div class="control-row"><label>Position X %</label><input type="range" id="cx" value="50" min="0" max="100"><span id="cxVal">50%</span></div>
          <div class="control-row"><label>Position Y %</label><input type="range" id="cy" value="50" min="0" max="100"><span id="cyVal">50%</span></div>
        </div>
        <div class="ellipse-inputs" id="ellipseInputs" style="display:none">
          <div class="control-row"><label>Radius X %</label><input type="range" id="rx" value="50" min="0" max="100"><span id="rxVal">50%</span></div>
          <div class="control-row"><label>Radius Y %</label><input type="range" id="ry" value="50" min="0" max="100"><span id="ryVal">50%</span></div>
          <div class="control-row"><label>Position X %</label><input type="range" id="ex" value="50" min="0" max="100"><span id="exVal">50%</span></div>
          <div class="control-row"><label>Position Y %</label><input type="range" id="ey" value="50" min="0" max="100"><span id="eyVal">50%</span></div>
        </div>
        <div class="inset-inputs" id="insetInputs" style="display:none">
          <div class="control-row"><label>Top</label><input type="range" id="top" value="0"><span id="topVal">0%</span></div>
          <div class="control-row"><label>Right</label><input type="range" id="right" value="0"><span id="rightVal">0%</span></div>
          <div class="control-row"><label>Bottom</label><input type="range" id="bottom" value="0"><span id="bottomVal">0%</span></div>
          <div class="control-row"><label>Left</label><input type="range" id="left" value="0"><span id="leftVal">0%</span></div>
        </div>
      </div>
      <div class="output"><code id="cssOutput"></code><button id="copyBtn">Copy</button></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .clip-container { max-width: 600px; margin: 0 auto; }
    .clip-container h2 { text-align: center; margin-bottom: var(--space-4); }
    .preview-box { width: 200px; height: 200px; margin: 0 auto var(--space-4); background: linear-gradient(135deg, #3b82f6, #8b5cf6); }
    .controls { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); margin-bottom: var(--space-4); }
    .control-group { margin-bottom: var(--space-3); }
    .control-group label { display: block; font-weight: 500; margin-bottom: var(--space-2); }
    .control-group select { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
    .polygon-inputs { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); }
    .point { display: flex; gap: 2px; }
    .point input { width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: var(--text-xs); text-align: center; }
    .control-row { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
    .control-row label { width: 100px; font-size: var(--text-sm); }
    .control-row input[type="range"] { flex: 1; }
    .control-row span { width: 40px; text-align: right; font-size: var(--text-xs); font-family: monospace; }
    .output { display: flex; gap: var(--space-2); background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-xl); }
    .output code { flex: 1; font-family: monospace; font-size: var(--text-sm); }
    #copyBtn { padding: var(--space-2) var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
  `;
  container.appendChild(style);

  function update() {
    const shape = container.querySelector('#shape').value;
    let clip = '';
    container.querySelector('#polygonInputs').style.display = shape === 'polygon' ? 'grid' : 'none';
    container.querySelector('#circleInputs').style.display = shape === 'circle' ? 'block' : 'none';
    container.querySelector('#ellipseInputs').style.display = shape === 'ellipse' ? 'block' : 'none';
    container.querySelector('#insetInputs').style.display = shape === 'inset' ? 'block' : 'none';
    if (shape === 'polygon') {
      const pts = [];
      for (let i = 1; i <= 4; i++) {
        const x = container.querySelector('#p' + i + 'x').value;
        const y = container.querySelector('#p' + i + 'y').value;
        pts.push(x + '% ' + y + '%');
      }
      clip = 'polygon(' + pts.join(', ') + ')';
    } else if (shape === 'circle') {
      const r = container.querySelector('#radius').value;
      const cx = container.querySelector('#cx').value;
      const cy = container.querySelector('#cy').value;
      clip = 'circle(' + r + '% at ' + cx + '% ' + cy + '%)';
      container.querySelector('#radiusVal').textContent = r + '%';
      container.querySelector('#cxVal').textContent = cx + '%';
      container.querySelector('#cyVal').textContent = cy + '%';
    } else if (shape === 'inset') {
      const t = container.querySelector('#top').value;
      const r = container.querySelector('#right').value;
      const b = container.querySelector('#bottom').value;
      const l = container.querySelector('#left').value;
      clip = 'inset(' + t + '% ' + r + '% ' + b + '% ' + l + '%)';
      container.querySelector('#topVal').textContent = t + '%';
      container.querySelector('#rightVal').textContent = r + '%';
      container.querySelector('#bottomVal').textContent = b + '%';
      container.querySelector('#leftVal').textContent = l + '%';
    } else if (shape === 'ellipse') {
      const rx = container.querySelector('#rx').value;
      const ry = container.querySelector('#ry').value;
      const ex = container.querySelector('#ex').value;
      const ey = container.querySelector('#ey').value;
      clip = 'ellipse(' + rx + '% ' + ry + '% at ' + ex + '% ' + ey + '%)';
      container.querySelector('#rxVal').textContent = rx + '%';
      container.querySelector('#ryVal').textContent = ry + '%';
      container.querySelector('#exVal').textContent = ex + '%';
      container.querySelector('#eyVal').textContent = ey + '%';
    }
    container.querySelector('#preview').style.clipPath = clip;
    container.querySelector('#cssOutput').textContent = 'clip-path: ' + clip + ';';
  }

  container.querySelector('#shape').addEventListener('change', update);
  container.querySelectorAll('input').forEach(function(i) { i.addEventListener('input', update); });
  container.querySelector('#copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cssOutput').textContent);
    container.querySelector('#copyBtn').textContent = 'Copied!';
    setTimeout(() => container.querySelector('#copyBtn').textContent = 'Copy', 1500);
  });
  update();
}
