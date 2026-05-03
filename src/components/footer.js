/**
 * Render the footer
 */
export function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="footer-logo">🛠️ XToolBox</span>
            <p class="footer-tagline">148 free online tools. All processing happens in your browser — your files never leave your device.</p>
          </div>

          <div class="footer-links">
            <h4>Popular Tools</h4>
            <a href="#/tools/compress-image">Image Compressor</a>
            <a href="#/tools/merge-pdf">Merge PDF</a>
            <a href="#/tools/remove-background">Background Remover</a>
            <a href="#/tools/image-to-text">OCR - Image to Text</a>
            <a href="#/tools/compress-video">Video Compressor</a>
            <a href="#/tools/qr-generator">QR Code Generator</a>
          </div>

          <div class="footer-links">
            <h4>Categories</h4>
            <a href="#/category/pdf">PDF Tools</a>
            <a href="#/category/image">Image Tools</a>
            <a href="#/category/video">Video Tools</a>
            <a href="#/category/audio">Audio Tools</a>
            <a href="#/category/privacy">Privacy Tools</a>
            <a href="#/category/dev">Developer Tools</a>
          </div>

          <div class="footer-links">
            <h4>Company</h4>
            <a href="#/about">About</a>
            <a href="#/privacy">Privacy Policy</a>
            <a href="#/terms">Terms of Service</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} XToolBox. All rights reserved to Tamer Osman. Built with ❤️ for your privacy.</p>
        </div>
      </div>
    </footer>
  `;
}
