import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob } from '../../utils/file.js';
import { escapeHtml } from '../../utils/escape-html.js';

export const toolConfig = {
  id: 'invoice-generator',
  name: 'Invoice Generator',
  category: 'business',
  description: 'Create professional PDF invoices with customizable fields.',
  icon: '📄',
  keywords: ['invoice', 'pdf', 'bill', '收取', 'receipt'],
  accept: '',
  maxSizeMB: 10
};

export function render(container) {
  let state = {
    items: [{ desc: '', qty: 1, price: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0
  };
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="invoice-form">
        <div class="form-section">
          <h3>From (Your Details)</h3>
          <input type="text" id="fromName" placeholder="Your Business Name" />
          <input type="text" id="fromAddress" placeholder="Your Address" />
          <input type="text" id="fromEmail" placeholder="Your Email" />
        </div>
        <div class="form-section">
          <h3>To (Client Details)</h3>
          <input type="text" id="toName" placeholder="Client Name" />
          <input type="text" id="toAddress" placeholder="Client Address" />
          <input type="text" id="toEmail" placeholder="Client Email" />
        </div>
        <div class="form-section">
          <h3>Invoice Details</h3>
          <input type="text" id="invoiceNum" placeholder="Invoice #" value="INV-001" />
          <input type="date" id="invoiceDate" />
          <input type="date" id="dueDate" />
        </div>
        <div class="form-section">
          <h3>Line Items</h3>
          <table id="itemsTable">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="itemsBody"></tbody>
          </table>
          <button type="button" id="addItem" class="btn-secondary">+ Add Item</button>
        </div>
        <div class="form-section totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span id="subtotal">$0.00</span>
          </div>
          <div class="total-row">
            <span>Tax (%):</span>
            <input type="number" id="taxRate" value="0" min="0" max="100" />
          </div>
          <div class="total-row">
            <span>Tax Amount:</span>
            <span id="taxAmount">$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span id="total">$0.00</span>
          </div>
        </div>
        <div class="form-section">
          <input type="text" id="notes" placeholder="Notes (optional)" />
        </div>
        <button type="button" id="generatePdf" class="btn-primary">Generate PDF Invoice</button>
      </div>
    </div>
  `;

  const $ = (id) => container.querySelector(id);
  const $$ = (sel) => Array.from(container.querySelectorAll(sel));
  const el = (id) => container.querySelector(id);

  $('#invoiceDate').valueAsDate = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 30);
  $('#dueDate').valueAsDate = due;

  function renderItems() {
    const tbody = $('#itemsBody');
    tbody.innerHTML = state.items.map((item, i) => `
      <tr>
        <td><input type="text" value="${escapeHtml(item.desc)}" data-idx="${i}" class="item-desc" placeholder="Description" /></td>
        <td><input type="number" value="${item.qty}" data-idx="${i}" class="item-qty" min="1" /></td>
        <td><input type="number" value="${item.price}" data-idx="${i}" class="item-price" min="0" step="0.01" /></td>
        <td>$${(item.qty * item.price).toFixed(2)}</td>
        <td><button type="button" class="btn-remove" data-idx="${i}">×</button></td>
      </tr>
    `).join('');

    bindItemListeners();
    calculateTotals();
  }

  function bindItemListeners() {
    $$('.item-desc').forEach(input => {
      input.addEventListener('input', (e) => {
        state.items[Number(e.target.dataset.idx)].desc = e.target.value;
      });
    });
    $$('.item-qty').forEach(input => {
      input.addEventListener('input', (e) => {
        state.items[Number(e.target.dataset.idx)].qty = parseFloat(e.target.value) || 0;
        renderItems();
      });
    });
    $$('.item-price').forEach(input => {
      input.addEventListener('input', (e) => {
        state.items[Number(e.target.dataset.idx)].price = parseFloat(e.target.value) || 0;
        renderItems();
      });
    });
    $$('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.items.splice(Number(e.target.dataset.idx), 1);
        if (state.items.length === 0) state.items.push({ desc: '', qty: 1, price: 0 });
        renderItems();
      });
    });
  }

  function calculateTotals() {
    state.subtotal = state.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxRate = parseFloat($('#taxRate').value) || 0;
    state.tax = state.subtotal * taxRate / 100;
    state.total = state.subtotal + state.tax;

    $('#subtotal').textContent = '$' + state.subtotal.toFixed(2);
    $('#taxAmount').textContent = '$' + state.tax.toFixed(2);
    $('#total').textContent = '$' + state.total.toFixed(2);
  }

  $('#addItem').addEventListener('click', () => {
    state.items.push({ desc: '', qty: 1, price: 0 });
    renderItems();
  });

  $('#taxRate').addEventListener('input', calculateTotals);

  $('#generatePdf').addEventListener('click', async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { width, height } = page.getSize();
      let y = height - 50;

      page.drawText('INVOICE', { x: 50, y, size: 24, font: fontBold, color: rgb(0, 0, 0) });
      page.drawText($('#invoiceNum').value, { x: width - 150, y, size: 12, font });

      y -= 40;
      page.drawText('From:', { x: 50, y, size: 10, font: fontBold });
      page.drawText($('#fromName').value || 'Your Business', { x: 50, y: y - 15, size: 10, font });
      page.drawText($('#fromAddress').value || '', { x: 50, y: y - 28, size: 10, font });
      page.drawText($('#fromEmail').value || '', { x: 50, y: y - 41, size: 10, font });

      page.drawText('To:', { x: 300, y, size: 10, font: fontBold });
      page.drawText($('#toName').value || 'Client Name', { x: 300, y: y - 15, size: 10, font });
      page.drawText($('#toAddress').value || '', { x: 300, y: y - 28, size: 10, font });
      page.drawText($('#toEmail').value || '', { x: 300, y: y - 41, size: 10, font });

      y -= 70;
      page.drawText('Invoice Date: ' + ($('#invoiceDate').value || ''), { x: 50, y, size: 10, font });
      page.drawText('Due Date: ' + ($('#dueDate').value || ''), { x: 200, y, size: 10, font });

      y -= 30;
      page.drawText('Description', { x: 50, y, size: 10, font: fontBold });
      page.drawText('Qty', { x: 300, y, size: 10, font: fontBold });
      page.drawText('Price', { x: 350, y, size: 10, font: fontBold });
      page.drawText('Total', { x: 450, y, size: 10, font: fontBold });

      y -= 5;
      page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 20;

      state.items.forEach(item => {
        if (item.desc || item.qty || item.price) {
          page.drawText(item.desc || 'Item', { x: 50, y, size: 10, font });
          page.drawText(String(item.qty), { x: 300, y, size: 10, font });
          page.drawText('$' + item.price.toFixed(2), { x: 350, y, size: 10, font });
          page.drawText('$' + (item.qty * item.price).toFixed(2), { x: 450, y, size: 10, font });
          y -= 20;
        }
      });

      y -= 20;
      page.drawRectangle({ x: 50, y, width: width - 100, height: 1, color: rgb(0.7, 0.7, 0.7) });
      y -= 20;

      page.drawText('Subtotal:', { x: 350, y, size: 10, font });
      page.drawText('$' + state.subtotal.toFixed(2), { x: 450, y, size: 10, font });
      y -= 15;

      const taxRate = parseFloat($('#taxRate').value) || 0;
      page.drawText('Tax (' + taxRate + '%):', { x: 350, y, size: 10, font });
      page.drawText('$' + state.tax.toFixed(2), { x: 450, y, size: 10, font });
      y -= 15;

      page.drawText('TOTAL:', { x: 350, y, size: 12, font: fontBold });
      page.drawText('$' + state.total.toFixed(2), { x: 450, y, size: 12, font: fontBold, color: rgb(0, 0.4, 0) });

      if ($('#notes').value) {
        y -= 50;
        page.drawText('Notes:', { x: 50, y, size: 10, font: fontBold });
        page.drawText($('#notes').value, { x: 50, y: y - 15, size: 10, font });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, 'invoice-' + $('#invoiceNum').value + '.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error: ' + err.message);
    }
  });

  renderItems();
}