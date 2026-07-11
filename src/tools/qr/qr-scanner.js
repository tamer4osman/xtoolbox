import { Html5Qrcode } from "html5-qrcode";
import { createScanner } from "./scanner-factory.js";

export const toolConfig = {
  id: "qr-scanner",
  name: "QR Code Scanner",
  category: "qr",
  description: "Scan and decode QR codes from images.",
  icon: "📷",
  status: "done"
};

function detectType(text) {
  if (text.startsWith("http")) return "URL";
  if (text.startsWith("WIFI:")) return "WiFi Network";
  if (text.startsWith("BEGIN:VCARD")) return "Contact (vCard)";
  if (text.startsWith("mailto:")) return "Email";
  if (text.startsWith("tel:")) return "Phone Number";
  if (text.startsWith("sms:")) return "SMS";
  if (text.startsWith("MECARD:")) return "Contact (MeCard)";
  return "Text";
}

export function render(container) {
  const scanner = createScanner({
    container,
    toolConfig,
    scanLabel: "QR code",
    resultTitle: "Decoded Content",
    resultMetaId: "result-type",
    hasCamera: true,
    hasOpenUrl: true,
    onScanFile: async file => {
      try {
        const html5QrCode = new Html5Qrcode("qr-scanner-reader");
        const text = await html5QrCode.scanFile(file, true);
        displayDecoded(text);
      } catch {
        scanner.showError("No QR code found in image. Please try a clearer image.");
      }
    }
  });

  const { elements } = scanner;

  function displayDecoded(text) {
    const type = detectType(text);
    scanner.showResult(text, `Type: ${type}`);
    elements.openUrl.classList.toggle("hidden", !text.startsWith("http"));
  }

  let cameraInstance = null;

  function onCameraSuccess(decodedText) {
    displayDecoded(decodedText);
  }

  elements.startCamera.addEventListener("click", async () => {
    elements.errorSection.classList.add("hidden");
    elements.resultSection.classList.add("hidden");
    elements.startCamera.classList.add("hidden");
    elements.stopCamera.classList.remove("hidden");

    try {
      cameraInstance = new Html5Qrcode("qr-scanner-reader");
      await cameraInstance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onCameraSuccess,
        () => {}
      );
    } catch (err) {
      elements.errorMessage.textContent = "Camera error: " + err.message;
      elements.errorSection.classList.remove("hidden");
      elements.startCamera.classList.remove("hidden");
      elements.stopCamera.classList.add("hidden");
    }
  });

  elements.stopCamera.addEventListener("click", async () => {
    if (cameraInstance) {
      await cameraInstance.stop();
      cameraInstance.clear();
    }
    elements.startCamera.classList.remove("hidden");
    elements.stopCamera.classList.add("hidden");
  });
}
