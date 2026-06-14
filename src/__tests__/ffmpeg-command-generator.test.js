import { describe, it, expect } from 'vitest';

describe('ffmpeg-command-generator', () => {
  it('exports toolConfig with correct properties', () => {
    const { toolConfig } = require('../src/tools/dev/ffmpeg-command-generator.js');
    expect(toolConfig.id).toBe('ffmpeg-command-generator');
    expect(toolConfig.name).toBe('FFmpeg Command Generator');
    expect(toolConfig.category).toBe('dev');
  });
});