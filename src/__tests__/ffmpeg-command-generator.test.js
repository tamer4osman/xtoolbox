import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/dev/ffmpeg-command-generator.js';

describe('ffmpeg-command-generator', () => {
  it('exports toolConfig with correct properties', () => {
    expect(toolConfig.id).toBe('ffmpeg-command-generator');
    expect(toolConfig.name).toBe('FFmpeg Command Generator');
    expect(toolConfig.category).toBe('dev');
  });
});
