# FALLOW Report

Last updated: 2026-06-13

## Project Overview

- **Total Files**: 524
- **Total LOC**: 49,790
- **Health Score**: 79.0 (Grade: B)
- **Maintainability Index**: 94.0 (good)

## Metrics Summary

| Metric         | Value | Status     |
| -------------- | ----- | ---------- |
| Dead Files     | 0%    | ✓          |
| Dead Exports   | 0%    | ✓          |
| Avg Cyclomatic | 1.8   | ✓          |
| P90 Cyclomatic | 4     | ✓          |
| Duplication    | 5.5%  | Acceptable |

## Function Size Distribution

- Low (1-15 LOC): 76%
- Medium (16-30 LOC): 12%
- High (31-60 LOC): 7%
- Very High (>60 LOC): 5%

## Deduplication Progress

### Factories Created

1. **codec-factory.js** - Encode/decode/copy/clear patterns
   - Migrated: base64-codec, url-codec, html-entity-codec, morse-code

2. **merge-tool-factory.js** - File merge patterns
   - Base for merge-audio, merge-pdf

3. **lookup-tool-factory.js** - Lookup API patterns
   - Migrated: thesaurus, air-quality, dictionary, book-lookup, holiday-calendar, sunrise-sunset

4. **onnx-tool-factory.js** - ONNX model patterns
   - Migrated: remove-background, upscale-image

5. **pixel-tool-factory.js** - Pixel manipulation patterns
   - Migrated: image-sharpening, pixelate-image

6. **video-tool-factory.js** - Video processing patterns
   - Migrated: video-speed, video-to-images, trim-video

7. **csv-parser.js** - CSV parsing utilities
   - Used by: csv-splitter, xml-to-csv

8. **file-list.js** - File list rendering
   - Used by: merge-audio, merge-pdf

## Complex Refactoring Targets

| File                      | Priority | Status              |
| ------------------------- | -------- | ------------------- |
| dom.js                    | 37.2     | Known - high impact |
| scientific-calculator.js  | 18.2     | Fixed               |
| user-agent-parser.js      | N/A      | Fixed               |
| blood-pressure-checker.js | N/A      | Fixed               |
| ideal-weight.js           | N/A      | Fixed               |
| cron-builder.js           | N/A      | Fixed               |

## Current Issues (Acceptable)

- Test file duplications: Expected for E2E test patterns
- High complexity functions: 157 - Most have test coverage
- Unresolved imports: 4 - codec-factory paths (framework-specific)

## Health Improvements

| Date       | Score | Change |
| ---------- | ----- | ------ |
| 2026-06-13 | 79.0  | +0.6   |
| Before     | 78.4  | -      |

## Recommendations

1. Add tests for codec-factory.js before further refactoring
2. Consider splitting dom.js if time permits (24 dependents)
3. Continue monitoring hotspots for future work
