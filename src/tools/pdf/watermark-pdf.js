import { rgb, StandardFonts } from "pdf-lib";
import { showToast } from "../../components/toast.js";
import { createPdfOverlayTool } from "./pdf-overlay-tool-factory.js";

export const toolConfig = {
  id: "watermark-pdf",
  name: "Add Watermark to PDF",
  category: "pdf",
  description: "Add text watermark to every page of a PDF.",
  icon: "💧",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["watermark pdf", "pdf watermark", "stamp pdf"],
  steps: [
    "Upload a PDF file",
    "Enter watermark text",
    "Choose font size, opacity, and position",
    "Download the watermarked PDF"
  ],
  faqs: [
    {
      question: "Can I watermark just some pages?",
      answer: "Currently the watermark is applied to all pages."
    },
    {
      question: "Can I use an image as a watermark?",
      answer: "Not yet. Text watermarks are supported now."
    }
  ]
};

export function render(container) {
  const { applyBtn, process } = createPdfOverlayTool({
    container,
    optionsHtml: `
      <div class="form-group">
        <label>Watermark Text</label>
        <input type="text" id="wm-text" class="text-input" value="CONFIDENTIAL" placeholder="Enter watermark text">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="form-group">
          <label>Font Size</label>
          <select id="wm-size" class="select-input">
            <option value="24">Small (24)</option>
            <option value="48" selected>Medium (48)</option>
            <option value="72">Large (72)</option>
            <option value="96">Extra Large (96)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Opacity</label>
          <select id="wm-opacity" class="select-input">
            <option value="0.1">Faint (10%)</option>
            <option value="0.2" selected>Light (20%)</option>
            <option value="0.4">Medium (40%)</option>
            <option value="0.6">Strong (60%)</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Position</label>
        <select id="wm-position" class="select-input">
          <option value="center" selected>Center</option>
          <option value="diagonal">Diagonal</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-center">Bottom Center</option>
        </select>
      </div>
    `
  });

  applyBtn.textContent = "Add Watermark";

  applyBtn.addEventListener("click", () => {
    process("watermarked.pdf", async pdfDoc => {
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const text = container.querySelector("#wm-text").value || "WATERMARK";
      const fontSize = parseInt(container.querySelector("#wm-size").value);
      const opacity = parseFloat(container.querySelector("#wm-opacity").value);
      const position = container.querySelector("#wm-position").value;

      pdfDoc.getPages().forEach(page => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x, y, rotate;
        if (position === "center") {
          x = (width - textWidth) / 2;
          y = height / 2 - fontSize / 2;
          rotate = 0;
        } else if (position === "diagonal") {
          x = (width - textWidth) / 2;
          y = height / 2;
          rotate = 45;
        } else if (position === "bottom-right") {
          x = width - textWidth - 50;
          y = 50;
          rotate = 0;
        } else {
          x = (width - textWidth) / 2;
          y = 50;
          rotate = 0;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity,
          rotate: rotate ? { type: "degrees", angle: rotate } : undefined
        });
      });
      showToast({ message: "Watermark added!", type: "success" });
    }).catch(err => showToast({ message: "Error: " + err.message, type: "error" }));
  });
}

export function destroy() {}
