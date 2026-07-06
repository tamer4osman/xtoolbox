import { $ } from '../utils/dom-query.js';
import { updatePageMeta } from '../utils/seo.js';

export function renderAbout() {
  const main = $('#main-content');

  updatePageMeta({
    title: 'About XToolBox',
    description: 'Learn about XToolBox — 312 free online tools with complete privacy. All processing happens in your browser.',
    url: `${window.location.origin}/about`
  });

  main.innerHTML = `
    <div class="container page-content" style="max-width:800px;">
      <h1 style="font-size:var(--text-3xl);font-weight:700;margin-bottom:var(--space-6);">About XToolBox</h1>

      <div style="color:var(--color-text-secondary);line-height:1.8;">
        <p style="margin-bottom:var(--space-4);font-size:var(--text-lg);">
          XToolBox is a collection of 312 free online tools that run entirely in your browser. No uploads, no servers, no privacy concerns.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">How It Works</h2>
        <p style="margin-bottom:var(--space-4);">
          Every tool in XToolBox uses client-side processing. This means all the work happens right in your web browser using JavaScript and WebAssembly. Your files are never uploaded to any server — they stay on your device the entire time.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Our Mission</h2>
        <p style="margin-bottom:var(--space-4);">
          We believe useful tools should be free and private. No sign-ups, no subscriptions, no data harvesting. Just tools that work.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Technology</h2>
        <p style="margin-bottom:var(--space-4);">
          Built with modern web technologies including WebAssembly (WASM), Canvas API, Web Crypto API, and more. This allows us to run powerful processing tools — like video editing, PDF manipulation, and AI-powered image processing — entirely in your browser.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Contact</h2>
        <p>Have questions or feedback? We'd love to hear from you. Reach out at <a href="mailto:hello@yourdomain.com">hello@yourdomain.com</a>.</p>
      </div>
    </div>
  `;
}
