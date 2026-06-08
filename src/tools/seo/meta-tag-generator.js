import { createGeneratorTool } from '../../utils/generator-tool.js';

export const toolConfig = {
  id: 'meta-tag-generator',
  name: 'Meta Tag Generator',
  category: 'seo',
  description: 'Generate SEO meta tags for your website.',
  icon: '🏷️',
  status: 'done'
};

export function render(container) {
  createGeneratorTool({
    container,
    title: 'Meta Tag Generator',
    renderForm: () => `
      <input type="text" id="title" placeholder="Page Title" value="My Page Title">
      <textarea id="desc" placeholder="Meta description...">Welcome to my website</textarea>
      <input type="text" id="keywords" placeholder="Keywords (comma separated)">
      <input type="text" id="canonical" placeholder="Canonical URL">
      <input type="text" id="ogTitle" placeholder="OG Title">
      <textarea id="ogDesc" placeholder="OG Description"></textarea>
      <input type="text" id="ogImage" placeholder="OG Image URL">
      <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;">
        <label><input type="checkbox" id="noindex"> Noindex</label>
        <label><input type="checkbox" id="nofollow"> Nofollow</label>
        <label><input type="checkbox" id="noarchive"> Noarchive</label>
        <label><input type="checkbox" id="nosnippet"> Nosnippet</label>
      </div>
    `,
    generate(c) {
      const title = c.querySelector('#title').value;
      const desc = c.querySelector('#desc').value;
      const keywords = c.querySelector('#keywords').value;
      const canonical = c.querySelector('#canonical').value;
      const ogTitle = c.querySelector('#ogTitle').value || title;
      const ogDesc = c.querySelector('#ogDesc').value || desc;
      const ogImage = c.querySelector('#ogImage').value;

      let tags = '<title>' + title + '</title>\n';
      if (desc) tags += '<meta name="description" content="' + desc + '">\n';
      if (keywords) tags += '<meta name="keywords" content="' + keywords + '">\n';
      if (canonical) tags += '<link rel="canonical" href="' + canonical + '">\n';
      tags += '\n<!-- Open Graph -->\n';
      tags += '<meta property="og:title" content="' + ogTitle + '">\n';
      tags += '<meta property="og:description" content="' + ogDesc + '">\n';
      if (ogImage) tags += '<meta property="og:image" content="' + ogImage + '">\n';
      tags += '\n<!-- Robots -->\n';
      if (c.querySelector('#noindex').checked) tags += '<meta name="robots" content="noindex">\n';
      if (c.querySelector('#nofollow').checked) tags += '<meta name="robots" content="nofollow">\n';
      if (c.querySelector('#noarchive').checked) tags += '<meta name="robots" content="noarchive">\n';
      if (c.querySelector('#nosnippet').checked) tags += '<meta name="robots" content="nosnippet">\n';
      return tags;
    }
  });
}
