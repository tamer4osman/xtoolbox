export const toolConfig = {
  id: 'split-pdf',
  name: 'Split PDF',
  category: 'pdf',
  description: 'Split a PDF into separate pages.',
  icon: '✂️',
  steps: ['Select PDF', 'Choose split options', 'Download']
};

export function render(container) {
  container.innerHTML = `
    <div class="split-container">
      <input type="file" id="split-input" accept="application/pdf">
      <div class="split-preview" id="split-preview"></div>
      <div class="split-options">
        <label><input type="radio" name="split-mode" value="all" checked> Extract all pages</label>
        <label><input type="radio" name="split-mode" value="range"> Page range</label>
        <input type="text" id="split-range" placeholder="e.g. 1-3, 5, 7-10" disabled>
      </div>
      <button id="split-btn" disabled>Split PDF</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .split-container { max-width: 500px; margin: 0 auto; }
    .split-container input[type="file"] { margin-bottom: var(--space-4); }
    .split-preview { min-height: 100px; padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); margin-bottom: var(--space-4); text-align: center; }
    .split-options { margin-bottom: var(--space-4); }
    .split-options label { display: block; padding: var(--space-2) 0; cursor: pointer; }
    .split-options input[type="text"] { width: 100%; padding: var(--space-2); border: 1px solid #ddd; border-radius: var(--radius-md); margin-top: var(--space-2); }
    #split-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    #split-btn:disabled { background: #ccc; }
  `;
  container.appendChild(style);

  let pdfDoc = null;

  container.querySelectorAll('input[name="split-mode"]').forEach(r => {
    r.addEventListener('change', () => {
      container.querySelector('#split-range').disabled = r.value !== 'range';
    });
  });

  container.querySelector('#split-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
    pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    container.querySelector('#split-preview').innerHTML = `PDF loaded: ${pdfDoc.getPageCount()} pages`;
    container.querySelector('#split-btn').disabled = false;
  });

  container.querySelector('#split-btn').addEventListener('click', async () => {
    if (!pdfDoc) return;
    
    const mode = container.querySelector('input[name="split-mode"]:checked').value;
    const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
    
    if (mode === 'all') {
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        const blob = new Blob([await newPdf.save()], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `page_${i + 1}.pdf`;
        a.click();
      }
    } else {
      const range = container.querySelector('#split-range').value;
      const pages = parseRange(range, pdfDoc.getPageCount());
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(pdfDoc, pages.map(p => p - 1));
      copied.forEach(p => newPdf.addPage(p));
      const blob = new Blob([await newPdf.save()], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'split.pdf';
      a.click();
    }
  });

  function parseRange(str, max) {
    const pages = new Set();
    str.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= Math.min(end, max); i++) pages.add(i);
      } else if (part) {
        const p = Number(part);
        if (p >= 1 && p <= max) pages.add(p);
      }
    });
    return [...pages].sort((a, b) => a - b);
  }

  return container;
}
