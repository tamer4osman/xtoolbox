export const toolConfig = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  category: 'pdf',
  description: 'Combine multiple PDF files into one.',
  icon: '📑',
  steps: ['Select PDF files', 'Merge']
};

export function render(container) {
  container.innerHTML = `
    <div class="pdf-container">
      <div class="pdf-drop" id="pdf-drop">
        <p>Drop PDF files here or click to select</p>
        <input type="file" id="pdf-input" accept="application/pdf" multiple hidden>
      </div>
      <div class="pdf-list" id="pdf-list"></div>
      <button id="pdf-merge" disabled>Merge PDFs</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .pdf-container { max-width: 500px; margin: 0 auto; }
    .pdf-drop { border: 2px dashed #ddd; border-radius: var(--radius-lg); padding: var(--space-6); text-align: center; cursor: pointer; margin-bottom: var(--space-4); transition: border-color 0.2s; }
    .pdf-drop:hover, .pdf-drop.dragover { border-color: var(--color-primary); }
    .pdf-list { margin-bottom: var(--space-4); max-height: 200px; overflow-y: auto; }
    .pdf-item { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2); background: #f5f5f5; border-radius: var(--radius-md); margin-bottom: var(--space-2); }
    .pdf-item span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pdf-item button { background: #d32f2f; color: white; border: none; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); cursor: pointer; }
    #pdf-merge { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    #pdf-merge:disabled { background: #ccc; cursor: not-allowed; }
  `;
  container.appendChild(style);

  const files = [];

  const drop = container.querySelector('#pdf-drop');
  const input = container.querySelector('#pdf-input');

  drop.addEventListener('click', () => input.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  input.addEventListener('change', e => handleFiles(e.target.files));

  function handleFiles(fils) {
    for (const f of fils) {
      if (f.type === 'application/pdf') {
        files.push(f);
      }
    }
    renderList();
  }

  function renderList() {
    container.querySelector('#pdf-list').innerHTML = files.map((f, i) => `
      <div class="pdf-item">
        <span>${f.name}</span>
        <button onclick="this.parentElement.remove(); files.splice(${i}, 1); renderList();">✕</button>
      </div>
    `).join('');
    container.querySelector('#pdf-merge').disabled = files.length < 2;
  }

  container.querySelector('#pdf-merge').addEventListener('click', async () => {
    if (files.length < 2) return;
    
    const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
    const merged = await PDFDocument.create();
    
    for (const file of files) {
      const data = await file.arrayBuffer();
      const doc = await PDFDocument.load(data);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    
    const pdf = await merged.save();
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged.pdf';
    a.click();
  });

  return container;
}
