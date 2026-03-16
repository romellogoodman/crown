import { describe, it, expect, vi } from 'vitest';
import { resolvePath, sortByOrder, debounce, measureTime } from '../src/core/utils.js';

describe('resolvePath', () => {
  it('returns absolute paths as-is', () => {
    expect(resolvePath('/base', '/absolute/path')).toBe('/absolute/path');
  });

  it('resolves relative paths against base', () => {
    const result = resolvePath('/base', 'relative/path');
    expect(result).toBe('/base/relative/path');
  });
});

describe('sortByOrder', () => {
  it('sorts by order field', () => {
    const items = [
      { frontmatter: { order: 3 }, path: 'c.md' },
      { frontmatter: { order: 1 }, path: 'a.md' },
      { frontmatter: { order: 2 }, path: 'b.md' },
    ];

    const sorted = sortByOrder(items);
    expect(sorted.map((i) => i.frontmatter.order)).toEqual([1, 2, 3]);
  });

  it('puts ordered items before unordered', () => {
    const items = [
      { frontmatter: {}, path: 'z.md' },
      { frontmatter: { order: 1 }, path: 'a.md' },
    ];

    const sorted = sortByOrder(items);
    expect(sorted[0].path).toBe('a.md');
  });

  it('sorts unordered items by filename', () => {
    const items = [
      { frontmatter: {}, path: 'c.md' },
      { frontmatter: {}, path: 'a.md' },
      { frontmatter: {}, path: 'b.md' },
    ];

    const sorted = sortByOrder(items);
    expect(sorted.map((i) => i.path)).toEqual(['a.md', 'b.md', 'c.md']);
  });
});

describe('debounce', () => {
  it('delays execution', async () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    await new Promise((r) => setTimeout(r, 100));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('measureTime', () => {
  it('returns result and duration', async () => {
    const { result, duration } = await measureTime(async () => 42);

    expect(result).toBe(42);
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});
