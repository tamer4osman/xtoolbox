import { describe, it, expect } from 'vitest';
import { toolConfig } from '../tools/image/passport-photo-maker.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('passport-photo-maker', () => {
  testSimpleToolConfig(toolConfig, 'passport-photo-maker', 'Passport / ID Photo Maker', 'image');
});