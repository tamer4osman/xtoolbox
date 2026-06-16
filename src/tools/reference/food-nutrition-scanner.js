import { escapeHtml } from '../../utils/escape-html.js';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'food-nutrition-scanner',
  name: 'Food Nutrition Scanner',
  category: 'reference',
  description: 'Scan food barcodes or search products to view detailed nutrition facts from Open Food Facts.',
  icon: '🍎',
  keywords: ['nutrition', 'food', 'barcode', 'calories', 'health'],
  accept: '',
  maxSizeMB: 0,
  status: 'done'
};

const API_BASE = 'https://world.openfoodfacts.org';
const NUTRIENTS = [
  { key: 'energy-kcal_100g', label: 'Energy', unit: 'kcal', highlight: true },
  { key: 'proteins_100g', label: 'Protein', unit: 'g', highlight: false },
  { key: 'carbohydrates_100g', label: 'Carbohydrates', unit: 'g', highlight: false },
  { key: 'sugars_100g', label: '  Sugars', unit: 'g', indent: true, highlight: true },
  { key: 'fat_100g', label: 'Fat', unit: 'g', highlight: false },
  { key: 'saturated-fat_100g', label: '  Saturated Fat', unit: 'g', indent: true, highlight: true },
  { key: 'fiber_100g', label: 'Fiber', unit: 'g', highlight: false },
  { key: 'salt_100g', label: 'Salt', unit: 'g', highlight: true },
  { key: 'sodium_100g', label: 'Sodium', unit: 'g', highlight: false }
];

const GRADE_COLORS = {
  a: { bg: '#1a9641', text: '#fff' },
  b: { bg: '#a6d96a', text: '#333' },
  c: { bg: '#fdae61', text: '#333' },
  d: { bg: '#f46d43', text: '#fff' },
  e: { bg: '#d73027', text: '#fff' }
};

const NUTRIENT_LEVELS = {
  fat: { label: 'Fat', high: 'high', low: 'low' },
  'saturated-fat': { label: 'Saturated Fat', high: 'high', low: 'low' },
  sugars: { label: 'Sugars', high: 'high', low: 'low' },
  salt: { label: 'Salt', high: 'high', low: 'low' }
};

export function parseNutriments(product) {
  const n = product.nutriments || {};
  return NUTRIENTS.map(item => ({
    label: item.label,
    unit: item.unit,
    indent: item.indent,
    highlight: item.highlight,
    value: n[item.key] != null ? Number(n[item.key]) : null
  }));
}

export function parseGrade(product) {
  return (product.nutrition_grades || product.nutriscore_grade || '').toLowerCase();
}

export function parseNutrientLevels(product) {
  const levels = product.nutrient_levels || {};
  return Object.entries(NUTRIENT_LEVELS).map(([key, meta]) => ({
    label: meta.label,
    level: levels[key] || null
  })).filter(n => n.level);
}

function gradeBadge(grade) {
  const c = GRADE_COLORS[grade];
  if (!c) return '';
  return `<span class="fn-badge" style="background:${c.bg};color:${c.text}">${grade.toUpperCase()}</span>`;
}

function nutrientLevelBar(level) {
  if (level === 'high') return '<span class="fn-level fn-level-high">High</span>';
  if (level === 'low') return '<span class="fn-level fn-level-low">Low</span>';
  return '';
}

function renderProduct(product) {
  const name = product.product_name || 'Unknown Product';
  const brand = product.brands || '';
  const image = product.image_front_url || product.image_url || '';
  const grade = parseGrade(product);
  const nutrients = parseNutriments(product);
  const levels = parseNutrientLevels(product);
  const ingredients = product.ingredients_text || product.ingredients_text_en || '';
  const allergens = product.allergens_tags || [];
  const categories = product.categories_tags || [];
  const quantity = product.quantity || '';

  const nutrientRows = nutrients.map(n => {
    const val = n.value != null ? n.value.toFixed(1) : '—';
    const indent = n.indent ? ' style="padding-left:var(--space-6)"' : '';
    const hl = n.highlight ? ' fn-highlight' : '';
    return `<tr${indent}><td class="fn-nut-label${hl}">${n.label}</td><td class="fn-nut-value">${val} ${n.unit}</td></tr>`;
  }).join('');

  const levelRows = levels.map(l =>
    `<div class="fn-level-row"><span>${l.label}</span>${nutrientLevelBar(l.level)}</div>`
  ).join('');

  const allergenTags = allergens.map(a => {
    const name = a.replace(/^en:/, '').replace(/-/g, ' ');
    return `<span class="fn-tag fn-tag-allergen">${escapeHtml(name)}</span>`;
  }).join('');

  const categoryTags = categories.slice(0, 5).map(c => {
    const name = c.replace(/^[a-z-]+:/, '').replace(/-/g, ' ');
    return `<span class="fn-tag">${escapeHtml(name)}</span>`;
  }).join('');

  return `
    <div class="fn-product">
      <div class="fn-product-header">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" class="fn-product-img" />` : ''}
        <div class="fn-product-info">
          <h2 class="fn-product-name">${escapeHtml(name)}</h2>
          ${brand ? `<div class="fn-product-brand">${escapeHtml(brand)}</div>` : ''}
          ${quantity ? `<div class="fn-product-qty">${escapeHtml(quantity)}</div>` : ''}
          <div class="fn-grade-row">
            <span class="fn-grade-label">Nutrition Grade:</span>
            ${gradeBadge(grade)}
          </div>
          ${categoryTags ? `<div class="fn-tags-row">${categoryTags}</div>` : ''}
        </div>
      </div>

      <div class="fn-section">
        <h3>Nutrition Facts <span class="fn-per">(per 100g)</span></h3>
        <table class="fn-nut-table">
          <thead><tr><th>Nutrient</th><th>Amount</th></tr></thead>
          <tbody>${nutrientRows}</tbody>
        </table>
      </div>

      ${levelRows ? `
        <div class="fn-section">
          <h3>Nutrient Levels</h3>
          <div class="fn-levels">${levelRows}</div>
        </div>
      ` : ''}

      ${allergenTags ? `
        <div class="fn-section">
          <h3>Allergens</h3>
          <div class="fn-tags-row">${allergenTags}</div>
        </div>
      ` : ''}

      ${ingredients ? `
        <div class="fn-section">
          <h3>Ingredients</h3>
          <p class="fn-ingredients">${escapeHtml(ingredients)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

function renderSearchResults(products) {
  if (!products.length) return '<p class="fn-empty">No products found.</p>';
  return `<div class="fn-results-list">
    ${products.map(p => {
      const name = p.product_name || 'Unknown';
      const brand = p.brands || '';
      const grade = parseGrade(p);
      const image = p.image_front_small_url || '';
      return `<button class="fn-result-item" data-barcode="${escapeHtml(p.code || '')}">
        ${image ? `<img src="${escapeHtml(image)}" alt="" class="fn-result-img" />` : '<div class="fn-result-img fn-result-placeholder"></div>'}
        <div class="fn-result-info">
          <div class="fn-result-name">${escapeHtml(name)}</div>
          <div class="fn-result-brand">${escapeHtml(brand)}</div>
        </div>
        ${grade ? gradeBadge(grade) : ''}
      </button>`;
    }).join('')}
  </div>`;
}

function renderHistory(history) {
  if (!history.length) return '';
  return `<div class="fn-section">
    <h3>Recent Scans</h3>
    <div class="fn-history">
      ${history.map(h => `<button class="fn-history-item" data-barcode="${escapeHtml(h.barcode)}">
        <span class="fn-history-name">${escapeHtml(h.name)}</span>
        <span class="fn-history-barcode">${escapeHtml(h.barcode)}</span>
      </button>`).join('')}
    </div>
  </div>`;
}

export function render(container) {
  container.innerHTML = `
    <div class="fn-container">
      <div class="fn-input-section">
        <div class="fn-tabs">
          <button class="fn-tab active" data-tab="barcode">Barcode Scan</button>
          <button class="fn-tab" data-tab="search">Product Search</button>
        </div>
        <div class="fn-tab-content" data-panel="barcode">
          <div class="fn-barcode-input">
            <input type="text" id="barcode-input" class="fn-input" placeholder="Enter barcode (e.g., 3017624010701)" maxlength="14" inputmode="numeric" />
            <button id="lookup-btn" class="fn-btn fn-btn-primary">Look Up</button>
          </div>
          <div id="camera-section" class="fn-camera-section">
            <button id="camera-btn" class="fn-btn fn-btn-secondary">Scan with Camera</button>
            <div id="camera-preview" class="fn-camera-preview" style="display:none">
              <video id="camera-video" autoplay playsinline></video>
              <canvas id="camera-canvas" style="display:none"></canvas>
              <button id="camera-stop" class="fn-btn fn-btn-ghost">Stop Camera</button>
            </div>
          </div>
        </div>
        <div class="fn-tab-content" data-panel="search" style="display:none">
          <div class="fn-barcode-input">
            <input type="text" id="search-input" class="fn-input" placeholder="Search by product name..." />
            <button id="search-btn" class="fn-btn fn-btn-primary">Search</button>
          </div>
        </div>
      </div>
      <div id="fn-status" class="fn-status"></div>
      <div id="fn-result" class="fn-result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .fn-container { max-width: 700px; margin: 0 auto; }
    .fn-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
    .fn-tab { flex: 1; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; font-weight: 600; color: var(--color-text-secondary); transition: all 0.15s; }
    .fn-tab.active { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }
    .fn-barcode-input { display: flex; gap: var(--space-3); }
    .fn-input { flex: 1; padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-base); background: var(--color-surface); }
    .fn-input:focus { outline: none; border-color: var(--color-primary); }
    .fn-btn { padding: var(--space-3) var(--space-4); border: none; border-radius: var(--radius-lg); font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
    .fn-btn-primary { background: var(--color-primary); color: white; }
    .fn-btn-primary:hover { filter: brightness(0.9); }
    .fn-btn-secondary { background: var(--color-surface); border: 2px solid var(--color-border); color: var(--color-text); }
    .fn-btn-ghost { background: none; border: none; color: var(--color-text-muted); text-decoration: underline; cursor: pointer; }
    .fn-camera-section { margin-top: var(--space-4); }
    .fn-camera-preview { margin-top: var(--space-3); text-align: center; }
    .fn-camera-preview video { max-width: 100%; max-height: 300px; border-radius: var(--radius-lg); border: 2px solid var(--color-border); }
    .fn-status { text-align: center; padding: var(--space-3); color: var(--color-text-secondary); }
    .fn-status.fn-loading { color: var(--color-primary); }
    .fn-status.fn-error { color: #dc2626; }
    .fn-empty { text-align: center; color: var(--color-text-muted); padding: var(--space-6); }
    .fn-product { margin-top: var(--space-4); }
    .fn-product-header { display: flex; gap: var(--space-4); margin-bottom: var(--space-4); }
    .fn-product-img { width: 140px; height: 140px; object-fit: contain; border-radius: var(--radius-lg); border: 2px solid var(--color-border); background: white; }
    .fn-product-info { flex: 1; }
    .fn-product-name { margin: 0 0 var(--space-1) 0; font-size: var(--text-xl); }
    .fn-product-brand { color: var(--color-text-secondary); font-weight: 500; }
    .fn-product-qty { color: var(--color-text-muted); font-size: var(--text-sm); margin-top: var(--space-1); }
    .fn-grade-row { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-2); }
    .fn-grade-label { font-weight: 600; font-size: var(--text-sm); }
    .fn-badge { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; font-weight: 700; font-size: var(--text-lg); }
    .fn-tags-row { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2); }
    .fn-tag { display: inline-block; padding: 2px 8px; border-radius: var(--radius-md); background: var(--color-bg-alt); font-size: var(--text-xs); color: var(--color-text-secondary); }
    .fn-tag-allergen { background: #fee2e2; color: #991b1b; }
    .fn-section { margin-bottom: var(--space-4); }
    .fn-section h3 { margin: 0 0 var(--space-3) 0; font-size: var(--text-base); }
    .fn-per { font-weight: 400; color: var(--color-text-muted); font-size: var(--text-sm); }
    .fn-nut-table { width: 100%; border-collapse: collapse; }
    .fn-nut-table th { text-align: left; padding: var(--space-2) var(--space-3); border-bottom: 2px solid var(--color-border); font-size: var(--text-sm); color: var(--color-text-muted); }
    .fn-nut-table td { padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border-light); }
    .fn-nut-label { color: var(--color-text); }
    .fn-nut-label.fn-highlight { font-weight: 600; }
    .fn-nut-value { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
    .fn-levels { display: flex; flex-direction: column; gap: var(--space-2); }
    .fn-level-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); background: var(--color-surface); border-radius: var(--radius-md); }
    .fn-level { padding: 2px 10px; border-radius: var(--radius-md); font-size: var(--text-xs); font-weight: 600; }
    .fn-level-high { background: #fee2e2; color: #991b1b; }
    .fn-level-low { background: #dcfce7; color: #166534; }
    .fn-ingredients { font-size: var(--text-sm); color: var(--color-text-secondary); line-height: 1.6; margin: 0; }
    .fn-results-list { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-4); }
    .fn-result-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface); cursor: pointer; text-align: left; width: 100%; transition: border-color 0.15s; }
    .fn-result-item:hover { border-color: var(--color-primary); }
    .fn-result-img { width: 48px; height: 48px; object-fit: contain; border-radius: var(--radius-md); background: white; border: 1px solid var(--color-border); flex-shrink: 0; }
    .fn-result-placeholder { display: flex; align-items: center; justify-content: center; }
    .fn-result-info { flex: 1; min-width: 0; }
    .fn-result-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fn-result-brand { font-size: var(--text-sm); color: var(--color-text-muted); }
    .fn-history { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .fn-history-item { display: flex; flex-direction: column; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); cursor: pointer; font-size: var(--text-sm); text-align: left; }
    .fn-history-item:hover { border-color: var(--color-primary); }
    .fn-history-name { font-weight: 500; }
    .fn-history-barcode { font-size: var(--text-xs); color: var(--color-text-muted); }
    @media (max-width: 600px) { .fn-product-header { flex-direction: column; align-items: center; text-align: center; } .fn-product-img { width: 120px; height: 120px; } }
  `;
  container.appendChild(style);

  const status = container.querySelector('#fn-status');
  const result = container.querySelector('#fn-result');
  const history = JSON.parse(localStorage.getItem('fn-history') || '[]');

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'fn-status' + (type ? ' fn-' + type : '');
  }

  function addToHistory(barcode, name) {
    const entry = { barcode, name, time: Date.now() };
    const filtered = history.filter(h => h.barcode !== barcode);
    filtered.unshift(entry);
    if (filtered.length > 10) filtered.length = 10;
    history.length = 0;
    history.push(...filtered);
    try { localStorage.setItem('fn-history', JSON.stringify(history)); } catch {}
  }

  async function lookupBarcode(barcode) {
    barcode = barcode.replace(/\D/g, '');
    if (!barcode) { setStatus('Enter a barcode number', 'error'); return; }
    setStatus('Looking up barcode...', 'loading');
    result.innerHTML = '';
    try {
      const res = await fetch(API_BASE + '/api/v2/product/' + barcode + '.json?fields=product_name,brands,image_front_url,image_front_small_url,nutriments,nutrition_grades,nutriscore_grade,nutrient_levels,ingredients_text,ingredients_text_en,allergens_tags,categories_tags,quantity,code');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.status !== 1 || !data.product) {
        setStatus('Product not found. Try another barcode.', 'error');
        return;
      }
      setStatus('');
      result.innerHTML = renderProduct(data.product);
      addToHistory(barcode, data.product.product_name || 'Unknown');
    } catch {
      setStatus('Failed to fetch product. Check your connection.', 'error');
    }
  }

  async function searchProducts(query) {
    query = query.trim();
    if (!query) { setStatus('Enter a product name', 'error'); return; }
    setStatus('Searching...', 'loading');
    result.innerHTML = '';
    try {
      const res = await fetch(API_BASE + '/cgi/search.pl?search_terms=' + encodeURIComponent(query) + '&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,brands,image_front_small_url,nutrition_grades');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const products = data.products || [];
      setStatus('');
      result.innerHTML = renderSearchResults(products);
      result.querySelectorAll('.fn-result-item').forEach(btn => {
        btn.addEventListener('click', () => lookupBarcode(btn.dataset.barcode));
      });
    } catch {
      setStatus('Search failed. Try again.', 'error');
    }
  }

  container.querySelectorAll('.fn-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.fn-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.fn-tab-content').forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      container.querySelector('[data-panel="' + tab.dataset.tab + '"]').style.display = '';
    });
  });

  container.querySelector('#lookup-btn').addEventListener('click', () => {
    lookupBarcode(container.querySelector('#barcode-input').value);
  });

  container.querySelector('#barcode-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') lookupBarcode(e.target.value);
  });

  container.querySelector('#search-btn').addEventListener('click', () => {
    searchProducts(container.querySelector('#search-input').value);
  });

  container.querySelector('#search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchProducts(e.target.value);
  });

  let cameraStream = null;
  let barcodeDetector = null;
  let scanInterval = null;

  const cameraSection = container.querySelector('#camera-section');
  const cameraPreview = container.querySelector('#camera-preview');
  const cameraVideo = container.querySelector('#camera-video');
  const cameraCanvas = container.querySelector('#camera-canvas');

  if ('BarcodeDetector' in window) {
    BarcodeDetector.getSupportedFormats().then(formats => {
      barcodeDetector = new BarcodeDetector({ formats });
    }).catch(() => {});
  }

  container.querySelector('#camera-btn').addEventListener('click', async () => {
    if (!barcodeDetector) {
      setStatus('Barcode detection not supported in this browser.', 'error');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraVideo.srcObject = cameraStream;
      cameraPreview.style.display = '';
      cameraSection.querySelector('#camera-btn').style.display = 'none';
      setStatus('Point camera at a barcode...', 'loading');
      scanInterval = setInterval(async () => {
        if (!barcodeDetector || !cameraVideo.videoWidth) return;
        try {
          const barcodes = await barcodeDetector.detect(cameraVideo);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            container.querySelector('#barcode-input').value = code;
            stopCamera();
            lookupBarcode(code);
          }
        } catch {}
      }, 500);
    } catch {
      setStatus('Camera access denied.', 'error');
    }
  });

  function stopCamera() {
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    cameraPreview.style.display = 'none';
    cameraSection.querySelector('#camera-btn').style.display = '';
  }

  container.querySelector('#camera-stop').addEventListener('click', stopCamera);

  if (history.length) {
    result.innerHTML = renderHistory(history);
    result.querySelectorAll('.fn-history-item').forEach(btn => {
      btn.addEventListener('click', () => lookupBarcode(btn.dataset.barcode));
    });
  }
}
