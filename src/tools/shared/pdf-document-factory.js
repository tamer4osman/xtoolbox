import { PDFDocument, StandardFonts } from "pdf-lib";
import { downloadBlob } from "../../utils/file.js";

export function createPdfDocumentTool({
  container,
  toolName,
  description,
  fieldsHTML,
  hintsHTML = "",
  buttonText = "Generate PDF",
  pageSize = [612, 792],
  errorLabel = "PDF",
  state = {},
  bindEvents = () => {},
  validate = () => null,
  buildPdf
}) {
  container.innerHTML = `
    <div class="tool-container">
      <h1>${toolName}</h1>
      <p>${description}</p>
      ${fieldsHTML}
      <button type="button" id="generatePdf" class="btn-primary">${buttonText}</button>
      ${hintsHTML}
    </div>
  `;

  const $ = sel => container.querySelector(sel);
  const el = sel => container.querySelector(sel);

  bindEvents({ $, el, state, container });

  el("#generatePdf").addEventListener("click", async () => {
    const error = validate(state, container);
    if (error) {
      alert(error);
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage(pageSize);
      const { width, height } = page.getSize();
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const filename = await buildPdf({
        pdfDoc,
        page,
        width,
        height,
        helveticaBold,
        helvetica,
        state,
        $,
        el,
        container
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating " + errorLabel + ": " + err.message);
    }
  });
}
