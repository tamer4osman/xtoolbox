import { testToolConfig } from './helpers/tool-config-test.js';

testToolConfig(() => import('../tools/text/line-sorter.js'), {
  id: 'line-sorter', name: 'Text Line Sorter', category: 'text'
});
