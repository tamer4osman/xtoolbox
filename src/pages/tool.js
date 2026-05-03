import { $, createElement } from '../utils/dom.js';
import { updatePageMeta, addStructuredData } from '../utils/seo.js';
import toolsData from '../data/tools.json';

const toolCache = {};

export async function renderTool(toolId) {
  const main = $('#main-content');
  if (!main) {
    console.error('Main content not found');
    return;
  }
  
  const toolMeta = toolsData.find(t => t.id === toolId);

  if (!toolMeta) {
    main.innerHTML = `<div class="container"><div class="error-page"><h1>Tool Not Found</h1><p>The tool you're looking for doesn't exist.</p><a href="#/" class="btn btn-primary">Go to Homepage</a></div></div>`;
    return;
  }

  updatePageMeta({
    title: `${toolMeta.name} - Free Online Tool`,
    description: toolMeta.description,
    url: `${window.location.origin}/tools/${toolId}`
  });

  addStructuredData({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": toolMeta.name,
    "description": toolMeta.description,
    "url": `${window.location.origin}/tools/${toolId}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  });

  main.innerHTML = `
    <div class="container">
      <div class="tool-page">
        <div class="tool-header">
          <span class="tool-icon">${toolMeta.icon}</span>
          <h1>${toolMeta.name}</h1>
          <p class="tool-description">${toolMeta.description}</p>
        </div>
        <div class="tool-loading" style="text-align:center;padding:2rem;">
          <div class="spinner"></div>
          <p>Loading tool...</p>
        </div>
      </div>
    </div>
  `;

  try {
    await new Promise(r => setTimeout(r, 50));
    const toolModule = await loadToolModule(toolMeta.category, toolId);
    const toolPage = main.querySelector('.tool-page');
    const loadingEl = toolPage?.querySelector('.tool-loading');
    if (!loadingEl) {
      console.error('Tool page not ready');
      return;
    }
    const toolContainer = createElement('div', { className: 'tool-container', id: 'tool-container' });
    loadingEl.replaceWith(toolContainer);

    const renderFn = toolModule.render || Object.values(toolModule).find(fn => typeof fn === 'function' && fn.name.startsWith('render'));
    if (renderFn) {
      renderFn(toolContainer);
      const internalHeaders = toolContainer.querySelectorAll('h1, h2, .tool-header');
      internalHeaders.forEach(h => h.remove());
    } else {
      console.error('No render function found in module:', toolModule);
    }

    // How to Use section
    if (toolMeta.steps) {
      const section = document.createElement('section');
      section.className = 'how-to-section';
      section.innerHTML = `<h2>How to Use</h2><ol class="how-to-steps">${toolMeta.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
      toolPage?.appendChild(section);
    }

    // FAQ section
    if (toolMeta.faqs) {
      const section = document.createElement('section');
      section.className = 'faq-section';
      section.innerHTML = `<h2>Frequently Asked Questions</h2><div class="faq-list">${toolMeta.faqs.map(faq => `<details class="faq-item"><summary>${faq.question}</summary><p>${faq.answer}</p></details>`).join('')}</div>`;
      toolPage?.appendChild(section);

      addStructuredData({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": toolMeta.faqs.map(faq => ({
          "@type": "Question", "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
      });
    }

    // Related tools
    const related = toolsData.filter(t => t.category === toolMeta.category && t.id !== toolId).slice(0, 6);
    if (related.length > 0) {
      const section = document.createElement('section');
      section.className = 'related-tools';
      section.innerHTML = `<h2>Related Tools</h2><div class="tools-grid">${related.map(t => `<a href="#/tools/${t.id}" class="tool-card" data-nav-link="/tools/${t.id}"><span class="tool-card-icon">${t.icon}</span><h3>${t.name}</h3><p>${t.description}</p></a>`).join('')}</div>`;
      toolPage?.appendChild(section);
    }
  } catch (error) {
    console.error('Error loading tool module:', error);
    const toolPage = main.querySelector('.tool-page');
    if (toolPage) {
      toolPage.innerHTML += `<div class="error-state"><p>Error loading tool: ${error.message}</p></div>`;
    }
  }
}

async function loadToolModule(category, toolId) {
  const cacheKey = `${category}/${toolId}`;
  if (toolCache[cacheKey]) return toolCache[cacheKey];
  let module;
  try {
    module = await import(`../tools/${category}/${toolId}.js`);
  } catch (error) {
    try {
      module = await import(`../tools/${category}/${toolId}.jsx`);
    } catch (jsxError) {
      throw new Error(`Could not load tool module: ${error.message} / ${jsxError.message}`);
    }
  }
  toolCache[cacheKey] = module;
  return module;
}
