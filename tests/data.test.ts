import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { loadData } from '../src/core/data.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');

describe('loadData', () => {
  it('loads JSON data', async () => {
    const data = await loadData({ test: 'data.json' }, FIXTURES);

    expect(data.test).toBeDefined();
    expect((data.test as { items: unknown[] }).items).toHaveLength(2);
  });

  it('loads CSV data with typed values', async () => {
    const data = await loadData({ people: 'data.csv' }, FIXTURES);

    const people = data.people as Array<{ name: string; age: number; active: boolean }>;
    expect(people).toHaveLength(2);
    expect(people[0].name).toBe('Alice');
    expect(people[0].age).toBe(30);
    expect(people[0].active).toBe(true);
  });

  it('loads YAML data', async () => {
    const data = await loadData({ config: 'data.yaml' }, FIXTURES);

    const config = data.config as { title: string; items: unknown[] };
    expect(config.title).toBe('Test Data');
    expect(config.items).toHaveLength(2);
  });

  it('loads multiple data sources at once', async () => {
    const data = await loadData(
      {
        json: 'data.json',
        csv: 'data.csv',
        yaml: 'data.yaml',
      },
      FIXTURES
    );

    expect(data.json).toBeDefined();
    expect(data.csv).toBeDefined();
    expect(data.yaml).toBeDefined();
  });

  it('returns empty object for no data sources', async () => {
    const data = await loadData({}, FIXTURES);
    expect(data).toEqual({});
  });

  it('throws on unsupported file format', async () => {
    await expect(
      loadData({ bad: 'template.html' }, FIXTURES)
    ).rejects.toThrow('Unsupported data file format');
  });
});
