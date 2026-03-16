import { describe, it, expect, vi } from 'vitest';
import { join } from 'node:path';
import { compileMarkdownFile, compileMarkdownFiles } from '../src/core/markdown.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');

describe('compileMarkdownFile', () => {
  it('parses valid frontmatter and renders HTML', async () => {
    const result = await compileMarkdownFile(join(FIXTURES, 'valid.md'), FIXTURES);

    expect(result.frontmatter.title).toBe('Test Chapter');
    expect(result.frontmatter.order).toBe(1);
    expect(result.frontmatter.id).toBe('test-chapter');
    expect(result.frontmatter.tags).toEqual(['fiction', 'example']);
    expect(result.html).toContain('<h1>Hello World</h1>');
    expect(result.html).toContain('<strong>bold</strong>');
    expect(result.html).toContain('<em>italic</em>');
  });

  it('handles files with no frontmatter', async () => {
    const result = await compileMarkdownFile(join(FIXTURES, 'no-frontmatter.md'), FIXTURES);

    expect(result.frontmatter).toEqual({});
    expect(result.html).toContain('<h1>No Frontmatter</h1>');
  });

  it('validates and coerces bad frontmatter types', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await compileMarkdownFile(join(FIXTURES, 'bad-frontmatter.md'), FIXTURES);

    // title should be coerced to string
    expect(result.frontmatter.title).toBe('123');
    // order should be deleted (not a number)
    expect(result.frontmatter.order).toBeUndefined();
    // tags should be deleted (not an array)
    expect(result.frontmatter.tags).toBeUndefined();
    // id should be coerced to string
    expect(result.frontmatter.id).toBe('42');

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('throws on nonexistent file', async () => {
    await expect(
      compileMarkdownFile(join(FIXTURES, 'nonexistent.md'), FIXTURES)
    ).rejects.toThrow('Failed to read content file');
  });
});

describe('compileMarkdownFiles', () => {
  it('compiles and sorts multiple files by order', async () => {
    const results = await compileMarkdownFiles('*.md', FIXTURES);

    expect(results.length).toBe(3);
    // valid.md has order: 1, so it should be first
    expect(results[0].frontmatter.order).toBe(1);
  });

  it('warns and returns empty array for no matches', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const results = await compileMarkdownFiles('*.nonexistent', FIXTURES);

    expect(results).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No content files found')
    );

    warnSpy.mockRestore();
  });
});
