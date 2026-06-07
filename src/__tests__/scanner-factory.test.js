import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createScanner } from '../tools/qr/scanner-factory.js';

function makeContainer() {
  const c = document.createElement('div');
  document.body.appendChild(c);
  return c;
}

function makeFile(name = 'test.png', type = 'image/png') {
  return new File(['x'], name, { type });
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('createScanner', () => {
  it('renders upload zone with toolConfig and scan label', () => {
    const container = makeContainer();
    createScanner({
      container,
      toolConfig: {
        id: 'test-scanner',
        name: 'Test Scanner',
        category: 'qr',
        description: 'Test desc',
        icon: '📷',
        status: 'done'
      },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile: async () => {}
    });
    expect(container.querySelector('#test-scanner-upload-zone')).toBeTruthy();
    expect(container.textContent).toContain('Drop QR code image here');
    expect(container.querySelector('#test-scanner-file-input')).toBeTruthy();
    expect(container.querySelector('#test-scanner-result')).toBeTruthy();
    expect(container.querySelector('#test-scanner-error')).toBeTruthy();
  });

  it('does not render camera tab when hasCamera=false', () => {
    const container = makeContainer();
    createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'B', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'barcode',
      resultTitle: 'Decoded Barcode',
      resultMetaId: 'result-format',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile: async () => {}
    });
    expect(container.querySelector('#test-scanner-camera-panel')).toBeFalsy();
    expect(container.querySelector('#test-scanner-tabs')).toBeFalsy();
  });

  it('renders camera tab when hasCamera=true', () => {
    const container = makeContainer();
    createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'Q', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: true,
      hasOpenUrl: true,
      onScanFile: async () => {}
    });
    expect(container.querySelector('#test-scanner-tabs')).toBeTruthy();
    expect(container.querySelector('#test-scanner-camera-panel')).toBeTruthy();
    expect(container.querySelector('#test-scanner-start-camera')).toBeTruthy();
    expect(container.querySelector('#test-scanner-stop-camera')).toBeTruthy();
    expect(container.querySelector('#test-scanner-open-url')).toBeTruthy();
  });

  it('does not render open-url button when hasOpenUrl=false', () => {
    const container = makeContainer();
    createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'B', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'barcode',
      resultTitle: 'Decoded Barcode',
      resultMetaId: 'result-format',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile: async () => {}
    });
    expect(container.querySelector('#test-scanner-open-url')).toBeFalsy();
  });

  it('calls onScanFile with file and elements when file input changes', async () => {
    const container = makeContainer();
    const onScanFile = vi.fn(async () => {});
    createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile
    });
    const file = makeFile();
    const input = container.querySelector('#test-scanner-file-input');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(onScanFile).toHaveBeenCalledTimes(1);
    expect(onScanFile.mock.calls[0][0]).toBe(file);
    expect(onScanFile.mock.calls[0][1]).toBeTruthy();
  });

  it('calls onScanFile when file is dropped on upload zone', async () => {
    const container = makeContainer();
    const onScanFile = vi.fn(async () => {});
    createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile
    });
    const file = makeFile();
    const zone = container.querySelector('#test-scanner-upload-zone');
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] } });
    zone.dispatchEvent(dropEvent);
    await new Promise(r => setTimeout(r, 0));
    expect(onScanFile).toHaveBeenCalledTimes(1);
    expect(onScanFile.mock.calls[0][0]).toBe(file);
  });

  it('exposes showResult helper that displays text and metadata', () => {
    const container = makeContainer();
    const { showResult } = createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile: async () => {}
    });
    showResult('hello', 'Type: URL');
    expect(container.querySelector('#test-scanner-result-content').textContent).toBe('hello');
    expect(container.querySelector('#test-scanner-result-type').textContent).toBe('Type: URL');
    expect(container.querySelector('#test-scanner-result').classList.contains('hidden')).toBe(false);
  });

  it('exposes showError helper that displays error message', () => {
    const container = makeContainer();
    const { showError } = createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile: async () => {}
    });
    showError('No code found');
    expect(container.querySelector('#test-scanner-error-message').textContent).toBe('No code found');
    expect(container.querySelector('#test-scanner-error').classList.contains('hidden')).toBe(false);
  });

  it('hides result and error before invoking onScanFile', async () => {
    const container = makeContainer();
    const { showResult } = createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: false,
      onScanFile: async () => {}
    });
    showResult('shown', 'shown');
    expect(container.querySelector('#test-scanner-result').classList.contains('hidden')).toBe(false);
    const input = container.querySelector('#test-scanner-file-input');
    Object.defineProperty(input, 'files', { value: [makeFile()], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
    expect(container.querySelector('#test-scanner-result').classList.contains('hidden')).toBe(true);
  });

  it('opens URL with noopener,noreferrer to prevent tabnabbing', () => {
    const openFn = vi.fn();
    vi.stubGlobal('open', openFn);
    const container = makeContainer();
    const { showResult } = createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: true,
      onScanFile: async () => {}
    });
    showResult('https://example.com', 'Type: URL');
    container.querySelector('#test-scanner-open-url').click();
    expect(openFn).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('does not open URL when result is not an http(s) URL', () => {
    const openFn = vi.fn();
    vi.stubGlobal('open', openFn);
    const container = makeContainer();
    const { showResult } = createScanner({
      container,
      toolConfig: { id: 'test-scanner', name: 'T', category: 'qr', description: '', icon: '', status: 'done' },
      scanLabel: 'QR code',
      resultTitle: 'Decoded Content',
      resultMetaId: 'result-type',
      hasCamera: false,
      hasOpenUrl: true,
      onScanFile: async () => {}
    });
    showResult('WIFI:T:WPA;S:foo;P:bar;;', 'Type: WiFi');
    container.querySelector('#test-scanner-open-url').click();
    expect(openFn).not.toHaveBeenCalled();
  });
});
