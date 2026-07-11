import { PDFDocument } from "pdf-lib";
import { createPdfOptionsTool } from "./pdf-options-tool-factory.js";

export const toolConfig = {
  id: "unlock-pdf",
  name: "Unlock PDF",
  category: "pdf",
  description: "Remove password protection from a PDF (requires password).",
  icon: "🔓",
  accept: ".pdf",
  maxSizeMB: 100,
  keywords: ["unlock pdf", "remove pdf password", "decrypt pdf"],
  steps: [
    "Upload a password-protected PDF",
    "Enter the password",
    'Click "Unlock"',
    "Download the unlocked PDF"
  ],
  faqs: [
    {
      question: "Can I unlock without the password?",
      answer: "No. You need the correct password to unlock a protected PDF."
    },
    {
      question: "Is the password sent to a server?",
      answer: "No. Everything happens in your browser. The password never leaves your device."
    }
  ]
};

export function render(container) {
  const optionsHTML = `
    <div class="form-group">
      <label>PDF Password</label>
      <input type="password" id="password-input" class="text-input" placeholder="Enter the PDF password">
    </div>
  `;

  createPdfOptionsTool({
    container,
    toolId: "unlock-pdf",
    optionsHTML,
    actionButtonText: "Unlock PDF",
    processingMessage: "Unlocking...",
    outputFilename: "unlocked.pdf",
    successMessage: "PDF unlocked!",
    validate: root => {
      const password = root.querySelector("#password-input").value;
      return password ? null : "Please enter the password";
    },
    process: async file => {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, {
        password: container.querySelector("#password-input").value
      });
      const unlockedBytes = await pdfDoc.save();
      return new Blob([unlockedBytes], { type: "application/pdf" });
    }
  });
}

export function destroy() {}
