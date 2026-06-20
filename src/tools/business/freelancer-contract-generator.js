import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadBlob } from '../../utils/file.js';

export const toolConfig = {
  id: 'freelancer-contract-generator',
  name: 'Freelancer Contract Generator',
  category: 'business',
  description: 'Generate freelance service contracts with scope, payment terms, deliverables, and IP ownership.',
  icon: '📝',
  keywords: ['freelance', 'contract', 'agreement', 'service', 'legal'],
  accept: '',
  maxSizeMB: 10
};

export function render(container) {
  let state = {
    clientName: '',
    clientCompany: '',
    freelancerName: '',
    projectScope: '',
    deliverables: '',
    paymentTerms: '50% upfront, 50% upon completion',
    rate: '',
    rateType: 'fixed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    ipTerms: 'Work for hire - Client owns all IP',
    governingLaw: 'California'
  };

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="form-section">
        <h3>Parties</h3>
        <div class="form-row">
          <div class="form-field">
            <label for="clientName">Client Name</label>
            <input type="text" id="clientName" placeholder="John Smith" />
          </div>
          <div class="form-field">
            <label for="clientCompany">Client Company</label>
            <input type="text" id="clientCompany" placeholder="Acme Corp" />
          </div>
        </div>
        <div class="form-field">
          <label for="freelancerName">Freelancer Name</label>
          <input type="text" id="freelancerName" placeholder="Your Name" />
        </div>
      </div>
      <div class="form-section">
        <h3>Project Details</h3>
        <div class="form-field">
          <label for="projectScope">Project Scope</label>
          <textarea id="projectScope" rows="4" placeholder="Describe the overall project and objectives..."></textarea>
        </div>
        <div class="form-field">
          <label for="deliverables">Deliverables</label>
          <textarea id="deliverables" rows="4" placeholder="List specific deliverables&#10;- Item 1&#10;- Item 2&#10;- Item 3"></textarea>
        </div>
      </div>
      <div class="form-section">
        <h3>Payment Terms</h3>
        <div class="form-row">
          <div class="form-field">
            <label for="rate">Project Fee / Rate</label>
            <input type="text" id="rate" placeholder="$5,000" />
          </div>
          <div class="form-field">
            <label for="rateType">Payment Structure</label>
            <select id="rateType">
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly</option>
              <option value="milestone">Milestone-based</option>
            </select>
          </div>
        </div>
        <div class="form-field">
          <label for="paymentTerms">Payment Terms</label>
          <input type="text" id="paymentTerms" placeholder="50% upfront, 50% upon completion" />
        </div>
      </div>
      <div class="form-section">
        <h3>Timeline</h3>
        <div class="form-row">
          <div class="form-field">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate" />
          </div>
          <div class="form-field">
            <label for="endDate">Estimated End Date</label>
            <input type="date" id="endDate" />
          </div>
        </div>
      </div>
      <div class="form-section">
        <h3>Intellectual Property</h3>
        <div class="form-field">
          <label for="ipTerms">IP Ownership Terms</label>
          <select id="ipTerms">
            <option value="work">Work for Hire - Client owns all IP</option>
            <option value="license">Freelancer retains IP, grants license</option>
            <option value="shared">Shared ownership</option>
          </select>
        </div>
      </div>
      <div class="form-section">
        <h3>Governing Law</h3>
        <select id="governingLaw">
          <option value="California">California</option>
          <option value="New York">New York</option>
          <option value="Texas">Texas</option>
          <option value="Delaware">Delaware</option>
        </select>
      </div>
      <button type="button" id="generatePdf" class="btn-primary">Generate Contract PDF</button>
    </div>
  `;

  const $ = (id) => container.querySelector(id);
  const el = (sel) => container.querySelector(sel);

  $('#startDate').value = state.startDate;

  el('#clientName').addEventListener('input', e => { state.clientName = e.target.value; });
  el('#clientCompany').addEventListener('input', e => { state.clientCompany = e.target.value; });
  el('#freelancerName').addEventListener('input', e => { state.freelancerName = e.target.value; });
  el('#projectScope').addEventListener('input', e => { state.projectScope = e.target.value; });
  el('#deliverables').addEventListener('input', e => { state.deliverables = e.target.value; });
  el('#rate').addEventListener('input', e => { state.rate = e.target.value; });
  el('#rateType').addEventListener('change', e => { state.rateType = e.target.value; });
  el('#paymentTerms').addEventListener('input', e => { state.paymentTerms = e.target.value; });
  el('#startDate').addEventListener('change', e => { state.startDate = e.target.value; });
  el('#endDate').addEventListener('change', e => { state.endDate = e.target.value; });
  el('#ipTerms').addEventListener('change', e => { state.ipTerms = e.target.value; });
  el('#governingLaw').addEventListener('change', e => { state.governingLaw = e.target.value; });

  el('#generatePdf').addEventListener('click', async () => {
    if (!state.clientName || !state.freelancerName || !state.projectScope) {
      alert('Please fill in client name, freelancer name, and project scope');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();

      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let y = height - 50;

      page.drawText('FREELANCE SERVICE AGREEMENT', {
        x: width / 2, y, size: 14, font: helveticaBold, color: rgb(0.1, 0.1, 0.1), align: 'center'
      });

      y -= 40;

      const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[TBD]';

      const addPara = (text, indent = 40) => {
        const words = text.split(' ');
        let line = '';
        words.forEach(word => {
          if ((line + word).length > 85) {
            page.drawText(line, { x: indent, y, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
            y -= 14;
            line = word + ' ';
          } else {
            line += word + ' ';
          }
        });
        if (line.trim()) {
          page.drawText(line.trim(), { x: indent, y, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
          y -= 14;
        }
      };

      addPara(`This Freelance Service Agreement ("Agreement") is entered into as of ${formatDate(state.startDate)} by and between:`);
      y -= 10;

      addPara(`${state.clientCompany || state.clientName} ("Client")`);
      addPara(`and`);
      addPara(`${state.freelancerName} ("Freelancer")`);
      y -= 20;

      addPara('1. PROJECT SCOPE', 40, 10, helveticaBold);
      addPara(state.projectScope || '[Project Scope]');
      y -= 15;

      addPara('2. DELIVERABLES', 40, 10, helveticaBold);
      const delims = (state.deliverables || '').split('\n').filter(d => d.trim());
      delims.forEach(d => addPara('- ' + d));
      y -= 15;

      addPara('3. COMPENSATION', 40, 10, helveticaBold);
      const rateDesc = state.rateType === 'fixed' 
        ? `Total Project Fee: ${state.rate || '[FEE]'}`
        : state.rateType === 'hourly'
        ? `Hourly Rate: ${state.rate || '[RATE]'}` + ' - Billed monthly'
        : `Milestone-based: ${state.rate || '[TERMS]'}`;
      addPara(rateDesc);
      addPara(`Payment Terms: ${state.paymentTerms || '[TERMS]'}`);
      y -= 15;

      addPara('4. TIMELINE', 40, 10, helveticaBold);
      addPara(`Start Date: ${formatDate(state.startDate)}`);
      if (state.endDate) addPara(`Estimated Completion: ${formatDate(state.endDate)}`);
      y -= 15;

      addPara('5. INTELLECTUAL PROPERTY', 40, 10, helveticaBold);
      const ipText = {
        work: 'Work for Hire. Upon full payment, Client shall own all right, title, and interest in the deliverables.',
        license: 'Freelancer retains ownership. Client receives a non-exclusive, perpetual license to use the work.',
        shared: 'Both parties retain joint ownership. Usage requires written consent from both.'
      }[state.ipTerms];
      addPara(ipText);
      y -= 15;

      addPara('6. INDEPENDENT CONTRACTOR', 40, 10, helveticaBold);
      addPara('Freelancer is an independent contractor, not an employee. Freelancer is responsible for all taxes and insurance.');
      y -= 15;

      addPara('7. CONFIDENTIALITY', 40, 10, helveticaBold);
      addPara('Both parties agree to keep confidential any proprietary information shared during the project.');
      y -= 15;

      addPara('8. TERMINATION', 40, 10, helveticaBold);
      addPara('Either party may terminate with 14 days written notice. Client pays for all work completed up to termination date.');
      y -= 15;

      addPara('9. GOVERNING LAW', 40, 10, helveticaBold);
      addPara(`This Agreement shall be governed by the laws of the State of ${state.governingLaw}.`);
      y -= 30;

      addPara('IN WITNESS WHEREOF, the parties have executed this Agreement.', 40);
      y -= 40;

      page.drawLine({ start: { x: 60, y: y }, end: { x: 280, y: y }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });
      page.drawText('Client Signature', { x: 60, y: y - 15, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`Date: ${formatDate(state.startDate)}`, { x: 60, y: y - 30, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

      page.drawLine({ start: { x: 330, y: y }, end: { x: 550, y: y }, thickness: 1, color: rgb(0.3, 0.3, 0.3) });
      page.drawText('Freelancer Signature', { x: 330, y: y - 15, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`Date: ${formatDate(state.startDate)}`, { x: 330, y: y - 30, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4) });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const filename = `freelance-contract-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating contract: ' + err.message);
    }
  });
}