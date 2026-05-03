export const toolConfig = {
  id: 'compress-pdf',
  name: 'Compress PDF',
  category: 'pdf',
  description: 'Reduce PDF file size.',
  icon: '📉',
  steps: ['Select PDF', 'Compress']
};

export function render(container) {
  container.innerHTML = `
    <div class="compress-container">
      <input type="file" id="compress-input" accept="application/pdf">
      <div class="compress-preview" id="compress-preview"></div>
      <label>Quality</label>
      <select id="compress-quality">
        <option value="0.3">Low (smaller file)</option>
        <option value="0.5" selected>Medium</option>
        <option value="0.8">High (larger file)</option>
      </select>
      <button id="compress-btn" disabled>Compress PDF</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .compress-container { max-width: 400px; margin: 0 auto; }
    .compress-container input[type="file"] { margin-bottom: var(--space-4); }
    .compress-preview { padding: var(--space-4); background: #f5f5f5; border-radius: var(--radius-lg); margin-bottom: var(--space-4); text-align: center; }
    .compress-container label { display: block; font-size: var(--text-sm); margin-bottom: var(--space-1); }
    .compress-container select { width: 100%; padding: var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); margin-bottom: var(--space-4); }
    #compress-btn { width: 100%; padding: var(--space-3); background: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; }
    #compress-btn:disabled { background: #ccc; }
  `;
  container.appendChild(style);

  let fileData = null;
  let origSize = 0;

  container.querySelector('#compress-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    origSize = file.size;
    fileData = await file.arrayBuffer();
    container.querySelector('#compress-preview').innerHTML = `Original: ${(origSize / 1024 / 1024).toFixed(2)} MB`;
    container.querySelector('#compress-btn').disabled = false;
  });

  container.querySelector('#compress-btn').addEventListener('click', async () => {
    if (!fileData) return;
    
    const { PDFDocument } = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm');
    const pdfDoc = await PDFDocument.load(fileData);
    const quality = parseFloat(container.querySelector('#compress-quality').value);
    
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { height } = page.getSize();
      page.setMediaBox(0, 0, page.getWidth(), height);
    }
    
    const compressed = await pdfDoc.save({ useObjectStreams: true });
    const blob = new Blob([compressed], { type: 'application/pdf' });
    
    const ratio = (blob.size / origSize * 100).toFixed(1);
    container.querySelector('#compress-preview').innerHTML = `
      Original: ${(origSize / 1024 / 1024).toFixed(2)} MB<br>
      Compressed: ${(blob.size / 1024 / 1024).toFixed(2)} MB<br>
      <strong>${ratio}% of original</strong>
    `;
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'compressed.pdf';
    a.click();
  });

  return container;
}
