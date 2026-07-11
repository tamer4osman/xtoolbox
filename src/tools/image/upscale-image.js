import { createOnnxTool } from "./onnx-tool-factory.js";

const { toolConfig, render, destroy } = createOnnxTool({
  toolConfig: {
    id: "upscale-image",
    name: "Image Upscaler",
    category: "image",
    description: "Upscale images 2x or 4x using AI super-resolution.",
    icon: "🔍",
    accept: "image/jpeg,image/png",
    maxSizeMB: 20,
    keywords: ["upscale image", "increase resolution", "image upscaler", "ai upscaler"],
    steps: [
      "Upload an image",
      "Choose scale (2x or 4x)",
      "Wait for AI processing",
      "Download upscaled image"
    ],
    faqs: [
      {
        question: "How does it work?",
        answer: "Uses Real-ESRGAN deep learning model running in your browser via ONNX Runtime Web."
      },
      {
        question: "What is the max input size?",
        answer: "Recommended max 512×512 for 4x, 1024×1024 for 2x to avoid memory issues."
      }
    ]
  },
  icon: "🔍",
  modelName: "Real-ESRGAN",
  modelSize: "8MB",
  modelFile: "realesrgan-x4.onnx"
});

export { toolConfig, render, destroy };
