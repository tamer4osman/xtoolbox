/**
 * Render the navigation bar
 */
export function renderNavbar() {
  return `
    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="#/" class="navbar-logo" data-nav-link="/">
          <span class="navbar-logo-icon">🛠️</span>
          <span class="navbar-logo-text">XToolBox</span>
        </a>

        <div class="navbar-search hide-mobile">
          <input type="text" id="navbar-search-input" placeholder="Search tools..." autocomplete="off">
          <div id="navbar-search-results" class="search-results"></div>
        </div>

        <div class="navbar-links hide-mobile">
          <a href="#/category/pdf" data-nav-link="/category/pdf">PDF</a>
          <a href="#/category/image" data-nav-link="/category/image">Image</a>
          <a href="#/category/video" data-nav-link="/category/video">Video</a>
          <a href="#/category/audio" data-nav-link="/category/audio">Audio</a>
          <a href="#/" data-nav-link="/">All Tools</a>
        </div>

        <button class="navbar-hamburger hide-desktop" id="hamburger-btn" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div class="navbar-mobile-menu" id="mobile-menu">
        <div class="navbar-mobile-search">
          <input type="text" id="mobile-search-input" placeholder="Search tools..." autocomplete="off">
        </div>
        <a href="#/" data-nav-link="/">🏠 All Tools</a>
        <a href="#/category/pdf" data-nav-link="/category/pdf">📄 PDF Tools</a>
        <a href="#/category/image" data-nav-link="/category/image">🖼️ Image Tools</a>
        <a href="#/category/video" data-nav-link="/category/video">🎬 Video Tools</a>
        <a href="#/category/audio" data-nav-link="/category/audio">🔊 Audio Tools</a>
        <a href="#/category/ocr" data-nav-link="/category/ocr">🔍 OCR Tools</a>
        <a href="#/category/qr" data-nav-link="/category/qr">📱 QR & Barcode</a>
        <a href="#/category/privacy" data-nav-link="/category/privacy">🔒 Privacy</a>
        <a href="#/category/weather" data-nav-link="/category/weather">🌤️ Weather</a>
        <a href="#/category/reference" data-nav-link="/category/reference">📚 Reference</a>
        <a href="#/category/finance" data-nav-link="/category/finance">💰 Finance</a>
        <a href="#/category/math" data-nav-link="/category/math">🔢 Math</a>
        <a href="#/category/health" data-nav-link="/category/health">🧮 Health</a>
        <a href="#/category/text" data-nav-link="/category/text">📝 Text</a>
        <a href="#/category/encoding" data-nav-link="/category/encoding">🔐 Encoding</a>
        <a href="#/category/visualization" data-nav-link="/category/visualization">📊 Visualization</a>
        <a href="#/category/css" data-nav-link="/category/css">🎨 CSS</a>
        <a href="#/category/dev" data-nav-link="/category/dev">🖥️ Developer</a>
      </div>
    </nav>
  `;
}

/**
 * Initialize navbar event listeners
 */
export function initNavbar() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Initialize search inputs (lazy import — breaks static dep on home.js)
  setTimeout(() => {
    import('../pages/home.js').then(m => m.initAllSearchInputs());
  }, 100);
}
