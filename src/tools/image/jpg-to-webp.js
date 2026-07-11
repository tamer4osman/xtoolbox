import { createFormatConverterTool } from "./format-converter-tool.js";

export const toolConfig = {
  id: "jpg-to-webp",
  name: "JPG to WebP Converter",
  category: "image",
  description: "Convert JPG images to WebP with quality control.",
  icon: "",
  accept: ".jpg,.jpeg",
  maxSizeMB: 50,
  keywords: ["jpg to webp", "jpeg to webp", "convert jpg", "webp converter"],
  steps: [
    "Upload JPG image(s)",
    "Adjust quality",
    'Click "Convert to WebP"',
    "Download converted images"
  ],
  faqs: [
    {
      question: "Why convert to WebP?",
      answer:
        "WebP offers better compression than JPG with similar or better quality, reducing file sizes by 25-35%."
    },
    {
      question: "What quality should I use?",
      answer:
        "80-90% is good for most images. WebP maintains quality better than JPG at lower bitrates."
    },
    {
      question: "Can I convert multiple JPGs?",
      answer: "Yes, upload multiple JPGs and they will all be converted."
    }
  ]
};

export const render = createFormatConverterTool({
  accept: toolConfig.accept,
  maxSizeMB: toolConfig.maxSizeMB,
  sourceFormatName: "JPG",
  sourceExtRegex: /\.(jpe?g)$/i,
  targetFormatName: "WebP",
  targetMime: "image/webp",
  targetExt: ".webp",
  qualityDefault: 85
});

export function destroy() {}
