import { createFileUpload } from "../../components/file-upload.js";
import { showToast } from "../../components/toast.js";
import { loadPdf, savePdf } from "./pdf-utils.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "fill-pdf-forms",
  name: "Fill PDF Forms",
  category: "pdf",
  description: "Fill in interactive PDF form fields and download.",
  icon: "✍️",
  accept: ".pdf",
  maxSizeMB: 50,
  keywords: ["fill pdf form", "pdf form filler", "fill pdf fields"],
  steps: [
    "Upload a PDF with form fields",
    "Fill in the form fields",
    'Click "Download Filled PDF"'
  ],
  faqs: [
    {
      question: "What if my PDF has no form fields?",
      answer: "You'll see a message saying no form fields were found."
    },
    {
      question: "Are my answers saved?",
      answer: "No. Everything is processed in your browser and nothing is stored."
    }
  ]
};

export function render(container) {
  let currentFile = null;

  const upload = createFileUpload({
    accept: ".pdf",
    multiple: false,
    maxSizeMB: 50,
    onFilesSelected: async files => {
      if (files.length === 0) return;
      currentFile = files[0];
      formArea.style.display = "block";
      formArea.innerHTML =
        '<div style="text-align:center;padding:var(--space-4);"><div class="spinner"></div></div>';

      try {
        const pdfDoc = await loadPdf(currentFile);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        if (fields.length === 0) {
          formArea.innerHTML =
            '<div style="text-align:center;padding:var(--space-8);color:var(--color-text-muted);">No form fields found in this PDF.</div>';
          return;
        }

        formArea.innerHTML = `<h3 style="margin-bottom:var(--space-4);">Form Fields (${fields.length})</h3>`;
        fields.forEach(field => {
          const name = field.getName();
          const type = field.constructor.name;
          const group = document.createElement("div");
          group.className = "form-group";
          group.innerHTML = `<label>${name} <span style="color:var(--color-text-muted);font-size:var(--text-xs);">(${type})</span></label>`;

          if (type === "PDFTextField") {
            const input = document.createElement("input");
            input.type = "text";
            input.className = "text-input";
            input.dataset.fieldName = name;
            input.placeholder = `Enter ${name}`;
            group.appendChild(input);
          } else if (type === "PDFCheckBox") {
            const label = document.createElement("label");
            label.className = "checkbox-label";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.dataset.fieldName = name;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(" " + name));
            group.appendChild(label);
          } else if (type === "PDFDropdown" || type === "PDFRadioGroup") {
            const select = document.createElement("select");
            select.className = "select-input";
            select.dataset.fieldName = name;
            try {
              const options = field.getOptions ? field.getOptions() : [];
              options.forEach(opt => {
                const option = document.createElement("option");
                option.value = typeof opt === "string" ? opt : opt.value || opt;
                option.textContent =
                  typeof opt === "string" ? opt : opt.display || opt.value || opt;
                select.appendChild(option);
              });
            } catch (e) {}
            group.appendChild(select);
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.className = "text-input";
            input.dataset.fieldName = name;
            input.placeholder = `[${type}]`;
            group.appendChild(input);
          }

          formArea.appendChild(group);
        });

        downloadBtn.style.display = "inline-flex";
      } catch (err) {
        formArea.innerHTML = `<div style="color:var(--color-error);padding:var(--space-4);">Error reading form: ${escapeHtml(err.message)}</div>`;
      }
    }
  });

  container.innerHTML = `
    <div class="tool-layout">
      <div class="tool-upload-area" id="upload-area"></div>
      <div id="form-area" style="display:none;margin:var(--space-6) 0;"></div>
      <button class="btn btn-primary btn-lg" id="download-btn" style="display:none;width:100%;">Download Filled PDF</button>
      <div class="tool-processing" id="processing" style="display:none;"><div class="spinner"></div><p>Filling form...</p></div>
    </div>
  `;

  container.querySelector("#upload-area").appendChild(upload.element);
  const formArea = container.querySelector("#form-area");
  const downloadBtn = container.querySelector("#download-btn");
  const processing = container.querySelector("#processing");

  downloadBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    processing.style.display = "block";

    try {
      const pdfDoc = await loadPdf(currentFile);
      const form = pdfDoc.getForm();

      formArea.querySelectorAll("[data-field-name]").forEach(el => {
        const name = el.dataset.fieldName;
        try {
          const field = form.getField(name);
          const type = field.constructor.name;
          if (type === "PDFTextField") field.setText(el.value);
          else if (type === "PDFCheckBox") {
            if (el.checked) field.check();
            else field.uncheck();
          } else if (type === "PDFDropdown") field.select(el.value);
        } catch (e) {}
      });

      await savePdf(pdfDoc, "filled-form.pdf");
      showToast({ message: "Form filled and saved!", type: "success" });
    } catch (err) {
      showToast({ message: "Error: " + err.message, type: "error" });
    } finally {
      processing.style.display = "none";
    }
  });
}

export function destroy() {}
