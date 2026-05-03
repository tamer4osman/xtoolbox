export function render(container) {
  container.innerHTML = `
    <div class="density-container">
      <h2>Keyword Density Checker</h2>
      <textarea id="content" placeholder="Paste your content here...">This is a sample text about SEO and search engine optimization. SEO is important for websites.</textarea>
      <input type="text" id="keyword" placeholder="Target keyword" value="SEO">
      <button id="analyzeBtn" class="analyze-btn">Analyze</button>
      <div class="stats">
        <div class="stat"><span class="value" id="count">0</span><span class="label">Occurrences</span></div>
        <div class="stat"><span class="value" id="density">0%</span><span class="label">Density</span></div>
        <div class="stat"><span class="value" id="words">0</span><span class="label">Total Words</span></div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .density-container { max-width: 700px; margin: 0 auto; }
    .density-container h2 { text-align: center; margin-bottom: var(--space-4); }
    #content { width: 100%; height: 150px; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface); resize: vertical; margin-bottom: var(--space-3); }
    #keyword { width: 100%; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-lg); margin-bottom: var(--space-3); }
    .analyze-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; margin-bottom: var(--space-4); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); }
    .stat { background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); text-align: center; }
    .stat .value { display: block; font-size: var(--text-3xl); font-weight: 700; color: var(--color-primary); }
    .stat .label { font-size: var(--text-sm); color: var(--color-text-secondary); }
  `;
  container.appendChild(style);

  container.querySelector('#analyzeBtn').addEventListener('click', () => {
    const content = container.querySelector('#content').value.toLowerCase();
    const keyword = container.querySelector('#keyword').value.toLowerCase().trim();
    if (!keyword) return;
    const words = content.split(/\s+/).filter(w => w);
    const regex = new RegExp(keyword, 'gi');
    const matchResult = content.match(regex);
    const count = matchResult ? matchResult : [];
    const density = words.length ? (count.length / words.length * 100).toFixed(2) : 0;
    container.querySelector('#count').textContent = count.length;
    container.querySelector('#density').textContent = density + '%';
    container.querySelector('#words').textContent = words.length;
  });
  container.querySelector('#analyzeBtn').click();
}
