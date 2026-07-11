import { $ } from "../utils/dom-query.js";
import { updatePageMeta } from "../utils/seo.js";

export function renderTerms() {
  const main = $("#main-content");

  updatePageMeta({
    title: "Terms of Service",
    description: "XToolBox Terms of Service — terms and conditions for using our tools.",
    url: `${window.location.origin}/terms`
  });

  main.innerHTML = `
    <div class="container page-content" style="max-width:800px;">
      <h1 style="font-size:var(--text-3xl);font-weight:700;margin-bottom:var(--space-6);">Terms of Service</h1>
      <p style="color:var(--color-text-muted);margin-bottom:var(--space-8);">Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div style="color:var(--color-text-secondary);line-height:1.8;">
        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Use at Your Own Risk</h2>
        <p style="margin-bottom:var(--space-4);">
          XToolBox is provided "as is" without warranty of any kind. We strive for accuracy and reliability, but we cannot guarantee that our tools will always produce correct results or be available without interruption.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">No Warranty</h2>
        <p style="margin-bottom:var(--space-4);">
          We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Limitation of Liability</h2>
        <p style="margin-bottom:var(--space-4);">
          In no event shall XToolBox be liable for any damages arising from the use of our tools, including but not limited to loss of data, profits, or business opportunities.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Your Responsibility</h2>
        <p style="margin-bottom:var(--space-4);">
          You are responsible for the files you process using our tools. Always keep backups of important files before processing them.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Changes</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of XToolBox constitutes acceptance of any changes.</p>
      </div>
    </div>
  `;
}
