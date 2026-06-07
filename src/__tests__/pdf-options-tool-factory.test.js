import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/file.js', async () => {
  const actual = await vi.importActual('../utils/file.js');
  return { ...actual, downloadBlob: vi.fn() };
});

import { createPdfOptionsTool } from '../tools/pdf/pdf-options-tool-factory.js';
import { downloadBlob } from '../utils/file.js';

function makeContainer() {
  const c = document.createElement('div');
  document.body.appendChild(c);
  return c;
}

beforeEach(() => {
  document.body.innerHTML = '';
  downloadBlob.mockClear();
});

function build(overrides = {}) {
  const container = makeContainer();
  const process = overrides.process || vi.fn(async () => new Blob(['x']));
  const result = createPdfOptionsTool({
    container,
    toolId: 'test-tool',
    accept: '.pdf',
    maxSizeMB: 100,
    optionsHTML: overrides.optionsHTML || '<input id="opt1" class="text-input" value="hello">',
    actionButtonText: 'Run Action',
    processingMessage: 'Working...',
    outputFilename: 'output.pdf',
    successMessage: 'Done!',
    process,
    ...overrides
  });
  return { container, result, process };
}

describe('createPdfOptionsTool', () => {
  it('renders the scaffold with upload area, options area, button, and processing', () => {
    const { container } = build();
    expect(container.querySelector('#test-tool-upload-area')).toBeTruthy();
    expect(container.querySelector('#test-tool-options-area')).toBeTruthy();
    expect(container.querySelector('#test-tool-action-btn')).toBeTruthy();
    expect(container.querySelector('#test-tool-processing')).toBeTruthy();
  });

  it('hides options area and processing initially', () => {
    const { container } = build();
    expect(container.querySelector('#test-tool-options-area').style.display).toBe('none');
    expect(container.querySelector('#test-tool-processing').style.display).toBe('none');
  });

  it('inserts optionsHTML inside the options area', () => {
    const { container } = build({ optionsHTML: '<div class="opt-marker">MYOPTS</div>' });
    const opt = container.querySelector('#test-tool-options-area .opt-marker');
    expect(opt).toBeTruthy();
    expect(opt.textContent).toBe('MYOPTS');
  });

  it('shows options area when a file is selected', () => {
    const { container } = build();
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);
    expect(container.querySelector('#test-tool-options-area').style.display).toBe('block');
  });

  it('hides options area again if file selection is cleared (empty array)', () => {
    const { container } = build();
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);
    expect(container.querySelector('#test-tool-options-area').style.display).toBe('none');
  });

  it('on action click, calls process(file), downloads blob with outputFilename, shows success toast', async () => {
    const blob = new Blob(['result-bytes'], { type: 'application/pdf' });
    const process = vi.fn(async () => blob);
    const { container } = build({ process, outputFilename: 'cropped.pdf', successMessage: 'Cropped!' });

    const file = new File(['x'], 'in.pdf', { type: 'application/pdf' });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);

    container.querySelector('#test-tool-action-btn').click();
    await new Promise(r => setTimeout(r, 30));

    expect(process).toHaveBeenCalledTimes(1);
    expect(process.mock.calls[0][0]).toBe(file);
    expect(downloadBlob).toHaveBeenCalledWith(blob, 'cropped.pdf');
    expect(document.querySelector('.toast')?.textContent).toContain('Cropped!');
  });

  it('shows processing and hides button while process is running', async () => {
    let resolve;
    const process = vi.fn(() => new Promise(r => { resolve = r; }));
    const { container } = build({ process });

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);
    container.querySelector('#test-tool-action-btn').click();
    await new Promise(r => setTimeout(r, 10));

    expect(container.querySelector('#test-tool-processing').style.display).toBe('block');
    expect(container.querySelector('#test-tool-action-btn').style.display).toBe('none');

    resolve(new Blob(['x']));
    await new Promise(r => setTimeout(r, 30));
    expect(container.querySelector('#test-tool-processing').style.display).toBe('none');
    expect(container.querySelector('#test-tool-action-btn').style.display).toBe('inline-flex');
  });

  it('shows error toast and restores UI when process throws', async () => {
    const process = vi.fn(async () => { throw new Error('boom'); });
    const { container } = build({ process });

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);
    container.querySelector('#test-tool-action-btn').click();
    await new Promise(r => setTimeout(r, 30));

    expect(document.querySelector('.toast')?.textContent).toContain('boom');
    expect(container.querySelector('#test-tool-processing').style.display).toBe('none');
    expect(container.querySelector('#test-tool-action-btn').style.display).toBe('inline-flex');
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it('validate() returning a string shows warning toast and does not call process', async () => {
    const process = vi.fn(async () => new Blob(['x']));
    const validate = vi.fn(() => 'Please enter a value');
    const { container } = build({ process, validate });

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);
    container.querySelector('#test-tool-action-btn').click();
    await new Promise(r => setTimeout(r, 30));

    expect(validate).toHaveBeenCalled();
    expect(process).not.toHaveBeenCalled();
    expect(document.querySelector('.toast')?.textContent).toContain('Please enter a value');
  });

  it('validate() returning null lets process run', async () => {
    const process = vi.fn(async () => new Blob(['x']));
    const validate = vi.fn(() => null);
    const { container } = build({ process, validate });

    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file] }, configurable: true });
    container.querySelector('.file-upload-dropzone').dispatchEvent(dropEvent);
    container.querySelector('#test-tool-action-btn').click();
    await new Promise(r => setTimeout(r, 30));

    expect(validate).toHaveBeenCalled();
    expect(process).toHaveBeenCalled();
  });
});
