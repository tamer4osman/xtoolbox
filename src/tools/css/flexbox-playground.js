import { createCssGenerator } from "./css-generator-factory.js";

export const toolConfig = {
  id: "flexbox-playground",
  name: "Flexbox Playground",
  category: "css",
  description: "Interactive CSS Flexbox tester with live preview and code output.",
  icon: "📦",
  status: "done"
};

export function render(container) {
  createCssGenerator({
    container,
    cssClass: "flex-gen",
    maxWidth: "800px",
    previewHTML:
      '<div class="preview" id="preview"><div class="item">1</div><div class="item">2</div><div class="item">3</div><div class="item">4</div></div>',
    extraCSS: `
      .flex-gen .preview { display: flex; background: var(--color-surface); padding: var(--space-4); border-radius: var(--radius-xl); min-height: 180px; margin-bottom: var(--space-4); }
      .flex-gen .item { width: 60px; height: 60px; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; border-radius: var(--radius-md); }
    `,
    controlsHTML: `
      <div class="control-row"><label>Justify Content</label><select id="jc"><option value="flex-start">flex-start</option><option value="flex-end">flex-end</option><option value="center" selected>center</option><option value="space-between">space-between</option><option value="space-around">space-around</option><option value="space-evenly">space-evenly</option></select></div>
      <div class="control-row"><label>Align Items</label><select id="ai"><option value="stretch">stretch</option><option value="flex-start">flex-start</option><option value="flex-end">flex-end</option><option value="center" selected>center</option><option value="baseline">baseline</option></select></div>
      <div class="control-row"><label>Flex Direction</label><select id="fd"><option value="row" selected>row</option><option value="row-reverse">row-reverse</option><option value="column">column</option><option value="column-reverse">column-reverse</option></select></div>
      <div class="control-row"><label>Flex Wrap</label><select id="fw"><option value="nowrap" selected>nowrap</option><option value="wrap">wrap</option><option value="wrap-reverse">wrap-reverse</option></select></div>
      <div class="control-row"><label>Gap</label><input type="range" id="gap" min="0" max="40" value="12"><span id="gapVal">12px</span></div>
    `,
    onUpdate: ({ values, preview, cssOutput, container }) => {
      const jc = values.jc,
        ai = values.ai,
        fd = values.fd,
        fw = values.fw,
        gap = values.gap;
      preview.style.justifyContent = jc;
      preview.style.alignItems = ai;
      preview.style.flexDirection = fd;
      preview.style.flexWrap = fw;
      preview.style.gap = gap + "px";
      cssOutput.textContent = `.container {
  display: flex;
  justify-content: ${jc};
  align-items: ${ai};
  flex-direction: ${fd};
  flex-wrap: ${fw};
  gap: ${gap}px;
}`;
      const gapVal = container.querySelector("#gapVal");
      if (gapVal) gapVal.textContent = gap + "px";
    }
  });
}
