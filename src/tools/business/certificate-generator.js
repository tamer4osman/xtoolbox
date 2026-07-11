import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { downloadBlob } from "../../utils/file.js";

export const toolConfig = {
  id: "certificate-generator",
  name: "Certificate Generator",
  category: "business",
  description:
    "Generate customized certificates from templates with recipient name, date, and custom text.",
  icon: "🏆",
  keywords: ["certificate", "award", "completion", "template", "pdf"],
  accept: "",
  maxSizeMB: 10
};

export function render(container) {
  let state = {
    template: "completion",
    recipientName: "",
    title: "Certificate of Completion",
    subtitle: "This is to certify that",
    body: "has successfully completed the course requirements",
    issuerName: "",
    issuerTitle: "",
    date: new Date().toISOString().split("T")[0]
  };

  const templates = {
    completion: {
      title: "Certificate of Completion",
      subtitle: "This is to certify that",
      body: "has successfully completed the course requirements"
    },
    achievement: {
      title: "Certificate of Achievement",
      subtitle: "This is to present this certificate to",
      body: "for outstanding performance and dedication"
    },
    participation: {
      title: "Certificate of Participation",
      subtitle: "This is to certify that",
      body: "has participated in the event"
    },
    award: {
      title: "Certificate of Award",
      subtitle: "Proudly presented to",
      body: "in recognition of excellence"
    }
  };

  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolConfig.name}</h1>
      <p>${toolConfig.description}</p>
      <div class="form-section">
        <label for="templateSelect">Certificate Template</label>
        <select id="templateSelect">
          <option value="completion">Completion</option>
          <option value="achievement">Achievement</option>
          <option value="participation">Participation</option>
          <option value="award">Award</option>
        </select>
      </div>
      <div class="form-section">
        <label for="recipientName">Recipient Name</label>
        <input type="text" id="recipientName" placeholder="John Doe" />
      </div>
      <div class="form-section">
        <label for="customTitle">Certificate Title (optional)</label>
        <input type="text" id="customTitle" placeholder="Overrides template title" />
      </div>
      <div class="form-section">
        <label for="certificateBody">Certificate Text</label>
        <textarea id="certificateBody" rows="3" placeholder="has successfully completed the course requirements"></textarea>
      </div>
      <div class="form-section">
        <label for="issuerName">Issuer/Organization Name</label>
        <input type="text" id="issuerName" placeholder="International Academy" />
      </div>
      <div class="form-section">
        <label for="issuerTitle">Issuer Title</label>
        <input type="text" id="issuerTitle" placeholder="Director" />
      </div>
      <div class="form-section">
        <label for="certificateDate">Date</label>
        <input type="date" id="certificateDate" />
      </div>
      <button type="button" id="generatePdf" class="btn-primary">Generate PDF Certificate</button>
      <div id="preview" class="preview-area"></div>
    </div>
  `;

  const $ = id => container.querySelector(id);
  const el = sel => container.querySelector(sel);

  $("#certificateDate").value = state.date;

  function updateFormFromTemplate() {
    const tpl = templates[state.template];
    $("#customTitle").value = "";
    $("#certificateBody").value = tpl.body;
    state.title = tpl.title;
    state.subtitle = tpl.subtitle;
    state.body = tpl.body;
  }

  updateFormFromTemplate();

  el("#templateSelect").addEventListener("change", e => {
    state.template = e.target.value;
    updateFormFromTemplate();
  });

  el("#recipientName").addEventListener("input", e => {
    state.recipientName = e.target.value;
  });

  el("#customTitle").addEventListener("input", e => {
    state.title = e.target.value || templates[state.template].title;
  });

  el("#certificateBody").addEventListener("input", e => {
    state.body = e.target.value;
  });

  el("#issuerName").addEventListener("input", e => {
    state.issuerName = e.target.value;
  });

  el("#issuerTitle").addEventListener("input", e => {
    state.issuerTitle = e.target.value;
  });

  el("#certificateDate").addEventListener("change", e => {
    state.date = e.target.value;
  });

  el("#generatePdf").addEventListener("click", async () => {
    if (!state.recipientName.trim()) {
      alert("Please enter a recipient name");
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([792, 612]);
      const { width, height } = page.getSize();

      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawRectangle({
        x: 30,
        y: 30,
        width: width - 60,
        height: height - 60,
        borderColor: rgb(0.15, 0.3, 0.5),
        borderWidth: 3
      });

      page.drawRectangle({
        x: 45,
        y: 45,
        width: width - 90,
        height: height - 90,
        borderColor: rgb(0.15, 0.3, 0.5),
        borderWidth: 1
      });

      page.drawText(state.title, {
        x: width / 2,
        y: height - 120,
        size: 36,
        font: helveticaBold,
        color: rgb(0.1, 0.2, 0.4),
        align: "center"
      });

      const formattedDate = new Date(state.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      page.drawText(formattedDate, {
        x: width / 2,
        y: height - 160,
        size: 12,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
        align: "center"
      });

      page.drawText(state.subtitle, {
        x: width / 2,
        y: height - 220,
        size: 16,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
        align: "center"
      });

      const nameSize = Math.min(32, 300 / Math.max(1, state.recipientName.length / 2));
      page.drawText(state.recipientName, {
        x: width / 2,
        y: height - 270,
        size: nameSize,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
        align: "center"
      });

      page.drawLine({
        start: { x: width / 2 - 100, y: height - 285 },
        end: { x: width / 2 + 100, y: height - 285 },
        thickness: 1,
        color: rgb(0.4, 0.4, 0.4)
      });

      const bodyLines = state.body.split("\n");
      let yOffset = height - 320;
      bodyLines.forEach(line => {
        page.drawText(line, {
          x: width / 2,
          y: yOffset,
          size: 14,
          font: helvetica,
          color: rgb(0.25, 0.25, 0.25),
          align: "center"
        });
        yOffset -= 24;
      });

      const signatureY = height - 450;
      page.drawLine({
        start: { x: 150, y: signatureY },
        end: { x: 350, y: signatureY },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3)
      });

      page.drawText(state.issuerName || "Organization", {
        x: 250,
        y: signatureY - 20,
        size: 12,
        font: helveticaBold,
        color: rgb(0.15, 0.15, 0.15),
        align: "center"
      });

      page.drawText(state.issuerTitle || "Authorized Signature", {
        x: 250,
        y: signatureY - 40,
        size: 10,
        font: helvetica,
        color: rgb(0.35, 0.35, 0.35),
        align: "center"
      });

      page.drawLine({
        start: { x: width - 350, y: signatureY },
        end: { x: width - 150, y: signatureY },
        thickness: 1,
        color: rgb(0.3, 0.3, 0.3)
      });

      page.drawText("Date", {
        x: width - 250,
        y: signatureY - 20,
        size: 12,
        font: helveticaBold,
        color: rgb(0.15, 0.15, 0.15),
        align: "center"
      });

      page.drawText(formattedDate, {
        x: width - 250,
        y: signatureY - 40,
        size: 10,
        font: helvetica,
        color: rgb(0.35, 0.35, 0.35),
        align: "center"
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const filename = `certificate-${state.recipientName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating certificate: " + err.message);
    }
  });
}
