import { describe } from 'vitest';
import { toolConfig } from '../tools/dev/curl-builder.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('curl-builder', () => {
  testSimpleToolConfig(toolConfig, 'curl-builder', 'cURL Command Builder', 'dev');
});
