import { createGeneratorTool } from '../../utils/generator-tool.js';

export const toolConfig = {
  id: 'robots-txt-generator',
  name: 'Robots.txt Generator',
  category: 'dev',
  description: 'Generate robots.txt files for SEO with visual rule builder.',
  icon: '🤖',
  status: 'done'
};

export function render(container) {
  createGeneratorTool({
    container,
    title: 'Robots.txt Generator',
    renderForm: () => `
      <input type="text" id="siteUrl" placeholder="https://example.com">
      <label><input type="checkbox" id="allowAll"> Allow all (empty rule)</label>
      <label><input type="checkbox" id="sitemap"> Include sitemap</label>
      <label><input type="checkbox" id="admin"> Block /admin/</label>
      <label><input type="checkbox" id="private"> Block /private/</label>
      <label><input type="checkbox" id="temp"> Block /tmp/</label>
      <label><input type="checkbox" id="cgi"> Block /cgi-bin/</label>
    `,
    generate(c) {
      let url = c.querySelector('#siteUrl').value.trim() || 'https://example.com';
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      url = url.replace(/\/$/, '');
      let code = `User-agent: *\n`;
      if (c.querySelector('#allowAll').checked) {
        code += 'Allow: /\n';
      } else {
        if (c.querySelector('#admin').checked) code += 'Disallow: /admin/\n';
        if (c.querySelector('#private').checked) code += 'Disallow: /private/\n';
        if (c.querySelector('#temp').checked) code += 'Disallow: /tmp/\n';
        if (c.querySelector('#cgi').checked) code += 'Disallow: /cgi-bin/\n';
      }
      if (c.querySelector('#sitemap').checked) code += `\nSitemap: ${url}/sitemap.xml`;
      return code;
    }
  });
}
