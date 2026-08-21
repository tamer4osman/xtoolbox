let activeLabel = null;

export function beginProcessing(label = "Processing") {
  activeLabel = String(label);
}

export function endProcessing() {
  activeLabel = null;
}

export function isProcessing() {
  return activeLabel !== null;
}

export function getProcessingLabel() {
  return activeLabel;
}
