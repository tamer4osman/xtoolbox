import { $ } from "../utils/dom-query.js";
import { updatePageMeta } from "../utils/seo.js";

export function renderPrivacy() {
  const main = $("#main-content");

  updatePageMeta({
    title: "Privacy Policy",
    description: "XToolBox Privacy Policy — how we handle your data and protect your privacy.",
    url: `${window.location.origin}/privacy`
  });

  main.innerHTML = `
    <div class="container page-content" style="max-width:800px;">
      <h1 style="font-size:var(--text-3xl);font-weight:700;margin-bottom:var(--space-6);">Privacy Policy</h1>
      <p style="color:var(--color-text-muted);margin-bottom:var(--space-8);">Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div style="color:var(--color-text-secondary);line-height:1.8;">
        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">File Processing</h2>
        <p style="margin-bottom:var(--space-4);">
          <strong>All file processing happens locally in your browser.</strong> Your files are never uploaded to our servers or any third-party servers. We have no access to your files whatsoever.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Analytics</h2>
        <p style="margin-bottom:var(--space-4);">
          We use Google Analytics to understand how visitors use our site. This collects anonymous data such as pages visited, time spent on site, and browser type. No personal files or processing data is collected.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Advertising</h2>
        <p style="margin-bottom:var(--space-4);">
          We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads">Google Ads Settings</a>.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Cookies</h2>
        <p style="margin-bottom:var(--space-4);">
          We use cookies for analytics and advertising purposes. You can control cookies through your browser settings.
        </p>

        <h2 style="font-size:var(--text-2xl);font-weight:600;margin:var(--space-8) 0 var(--space-4);">Contact</h2>
        <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:privacy@yourdomain.com">privacy@yourdomain.com</a>.</p>
      </div>
    </div>
  `;
}
