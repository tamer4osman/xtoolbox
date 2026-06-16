import { describe, it, expect } from 'vitest';
import { toolConfig, parseFeatures } from '../tools/reference/earthquake-monitor.js';
import { testSimpleToolConfig } from './tool-config-test.js';

describe('earthquake-monitor', () => {
  testSimpleToolConfig(toolConfig, 'earthquake-monitor', 'Earthquake Monitor', 'reference');
});

describe('parseFeatures', () => {
  it('parses USGS GeoJSON features', () => {
    const features = [
      {
        id: 'us123',
        properties: {
          mag: 5.2,
          place: '10 km NE of Tokyo',
          time: 1700000000000,
          url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us123',
          tsunami: 0,
          sig: 400,
          magType: 'mw',
          type: 'earthquake'
        },
        geometry: {
          coordinates: [139.69, 35.68, 30.5]
        }
      }
    ];
    const result = parseFeatures(features);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('us123');
    expect(result[0].mag).toBe(5.2);
    expect(result[0].place).toBe('10 km NE of Tokyo');
    expect(result[0].depth).toBe(30.5);
    expect(result[0].lat).toBe(35.68);
    expect(result[0].lon).toBe(139.69);
    expect(result[0].tsunami).toBe(false);
  });

  it('handles tsunami flag', () => {
    const features = [{
      id: 't1',
      properties: { mag: 7.0, place: 'Pacific Ocean', time: 1700000000000, url: '', tsunami: 1, sig: 800, magType: 'mw', type: 'earthquake' },
      geometry: { coordinates: [0, 0, 10] }
    }];
    const result = parseFeatures(features);
    expect(result[0].tsunami).toBe(true);
  });

  it('handles missing place', () => {
    const features = [{
      id: 'm1',
      properties: { mag: 1.0, place: null, time: 1700000000000, url: '', tsunami: 0, sig: 10, magType: 'ml', type: 'earthquake' },
      geometry: { coordinates: [0, 0, 5] }
    }];
    const result = parseFeatures(features);
    expect(result[0].place).toBe('Unknown location');
  });

  it('parses multiple features', () => {
    const features = [
      { id: 'a', properties: { mag: 3.0, place: 'A', time: 1, url: '', tsunami: 0, sig: 100, magType: 'ml', type: 'earthquake' }, geometry: { coordinates: [0, 0, 1] } },
      { id: 'b', properties: { mag: 4.5, place: 'B', time: 2, url: '', tsunami: 0, sig: 200, magType: 'mb', type: 'earthquake' }, geometry: { coordinates: [1, 1, 2] } }
    ];
    expect(parseFeatures(features)).toHaveLength(2);
  });
});
