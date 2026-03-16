import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { TemplateRenderer } from '../src/core/template.js';
import type { TemplateContext } from '../src/types/content.js';

const FIXTURES = join(import.meta.dirname, 'fixtures');

function createContext(overrides: Partial<TemplateContext> = {}): TemplateContext {
  return {
    metadata: {
      title: 'Test Book',
      author: 'Test Author',
      subject: '',
      keywords: [],
      lang: 'en',
    },
    chapters: [
      {
        path: 'test.md',
        absolutePath: '/test.md',
        frontmatter: { title: 'Chapter 1' },
        html: '<p>Hello</p>',
        raw: 'Hello',
      },
    ],
    data: {},
    generatedDate: new Date('2024-01-01'),
    ...overrides,
  };
}

describe('TemplateRenderer', () => {
  it('renders a template with context', async () => {
    const renderer = new TemplateRenderer(join(FIXTURES, 'template.html'));
    await renderer.registerPartials();

    const html = await renderer.render(createContext());

    expect(html).toContain('<title>Test Book</title>');
    expect(html).toContain('lang="en"');
    expect(html).toContain('<h1>Chapter 1</h1>');
    expect(html).toContain('<p>Hello</p>');
  });

  it('renders multiple chapters', async () => {
    const renderer = new TemplateRenderer(join(FIXTURES, 'template.html'));
    const ctx = createContext({
      chapters: [
        { path: 'a.md', absolutePath: '/a.md', frontmatter: { title: 'A' }, html: '<p>A</p>', raw: 'A' },
        { path: 'b.md', absolutePath: '/b.md', frontmatter: { title: 'B' }, html: '<p>B</p>', raw: 'B' },
      ],
    });

    const html = await renderer.render(ctx);

    expect(html).toContain('<h1>A</h1>');
    expect(html).toContain('<h1>B</h1>');
  });

  it('throws on nonexistent helpers file', async () => {
    const renderer = new TemplateRenderer(join(FIXTURES, 'template.html'));

    await expect(
      renderer.registerCustomHelpers('/nonexistent/helpers.js')
    ).rejects.toThrow('Custom helpers file not found');
  });

  it('createContext builds valid context', () => {
    const ctx = TemplateRenderer.createContext(
      [],
      { title: 'T', author: 'A', subject: '', keywords: [], lang: 'en' },
      { myData: [1, 2, 3] }
    );

    expect(ctx.metadata.title).toBe('T');
    expect(ctx.chapters).toEqual([]);
    expect(ctx.data.myData).toEqual([1, 2, 3]);
    expect(ctx.generatedDate).toBeInstanceOf(Date);
  });
});
