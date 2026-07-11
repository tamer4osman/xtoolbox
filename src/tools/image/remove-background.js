import { createOnnxTool } from "./onnx-tool-factory.js";

const { toolConfig, render, destroy } = createOnnxTool({
  toolConfig: {
    id: "remove-background",
    name: "Background Remover",
    category: "image",
    description: "Remove background from images using AI. Works 100% in your browser.",
    icon: "🎭",
    accept: "image/jpeg,image/png",
    maxSizeMB: 20,
    keywords: ["remove background", "background remover", "transparent background"],
    steps: [
      "Upload an image (JPG or PNG)",
      "Wait for AI processing",
      "Preview result with transparency",
      "Download PNG with transparent background"
    ],
    faqs: [
      {
        question: "How does it work?",
        answer:
          "Uses a U2-Net deep learning model running entirely in your browser via ONNX Runtime Web."
      },
      {
        question: "Is it accurate?",
        answer: "It works best with clear foreground objects like people, products, and animals."
      }
    ]
  },
  icon: "🎭",
  modelName: "U2-Net",
  modelSize: "4MB",
  modelFile: "u2net.onnx"
});

export { toolConfig, render, destroy };
