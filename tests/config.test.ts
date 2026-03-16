import { describe, it, expect } from 'vitest';
import { resolveConfig } from '../src/core/config.js';
import type { CrownConfig } from '../src/types/config.js';

const minimalConfig: CrownConfig = {
  input: {
    content: 'src/content/**/*.md',
    template: 'src/templates/layout.html',
    styles: 'src/styles.css',
  },
  output: {
    html: 'dist/book.html',
    pdf: 'dist/book.pdf',
  },
};

describe('resolveConfig', () => {
  it('applies defaults for missing optional fields', () => {
    const resolved = resolveConfig(minimalConfig, '/project');

    expect(resolved.metadata.title).toBe('Untitled Book');
    expect(resolved.metadata.lang).toBe('en');
    expect(resolved.page.size).toBe('A4');
    expect(resolved.prince.executablePath).toBe('prince');
    expect(resolved.devServer.port).toBe(3000);
    expect(resolved.helpers).toBeNull();
    expect(resolved.data).toEqual({});
    expect(resolved.markdown.gfm).toBe(true);
    expect(resolved.markdown.breaks).toBe(false);
    expect(resolved.markdown.extensions).toEqual([]);
  });

  it('merges user config with defaults', () => {
    const config: CrownConfig = {
      ...minimalConfig,
      metadata: { title: 'My Book', author: 'Me' },
      markdown: { breaks: true },
    };

    const resolved = resolveConfig(config, '/project');

    expect(resolved.metadata.title).toBe('My Book');
    expect(resolved.metadata.author).toBe('Me');
    expect(resolved.metadata.lang).toBe('en'); // default preserved
    expect(resolved.markdown.breaks).toBe(true);
    expect(resolved.markdown.gfm).toBe(true); // default preserved
  });

  it('resolves paths relative to root', () => {
    const resolved = resolveConfig(minimalConfig, '/project');

    expect(resolved.input.content).toBe('/project/src/content/**/*.md');
    expect(resolved.output.pdf).toBe('/project/dist/book.pdf');
    expect(resolved.root).toBe('/project');
  });

  it('throws on missing required input fields', () => {
    expect(() =>
      resolveConfig({} as CrownConfig, '/project')
    ).toThrow('input');

    expect(() =>
      resolveConfig({ input: { content: 'x', template: 'x', styles: 'x' } } as CrownConfig, '/project')
    ).toThrow('output');
  });

  it('does not mutate the original config object', () => {
    const original = JSON.parse(JSON.stringify(minimalConfig));
    resolveConfig(minimalConfig, '/project');
    expect(minimalConfig).toEqual(original);
  });
});
