import { describe, it, expect } from 'vitest';
import { configToPrinceOptions } from '../src/core/prince.js';
import type { ResolvedCrownConfig } from '../src/types/config.js';

function createMockConfig(overrides: Partial<ResolvedCrownConfig> = {}): ResolvedCrownConfig {
  return {
    input: { content: '', template: '', styles: '' },
    output: { html: '', pdf: '' },
    metadata: { title: 'Test', author: 'Author', subject: '', keywords: ['a', 'b'], lang: 'en' },
    page: { size: 'A4', margins: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm', inside: '2cm', outside: '2cm' } },
    prince: { javascript: true, verbose: false, options: [], executablePath: 'prince' },
    devServer: { port: 3000, host: 'localhost', open: true },
    data: {},
    helpers: null,
    markdown: { gfm: true, breaks: false, extensions: [] },
    root: '/project',
    ...overrides,
  };
}

describe('configToPrinceOptions', () => {
  it('maps config to prince options', () => {
    const config = createMockConfig();
    const options = configToPrinceOptions(config);

    expect(options.executablePath).toBe('prince');
    expect(options.javascript).toBe(true);
    expect(options.verbose).toBe(false);
    expect(options.metadata?.title).toBe('Test');
    expect(options.metadata?.keywords).toEqual(['a', 'b']);
  });

  it('passes additional options through', () => {
    const config = createMockConfig({
      prince: { javascript: false, verbose: true, options: ['--no-network'], executablePath: '/usr/bin/prince' },
    });
    const options = configToPrinceOptions(config);

    expect(options.executablePath).toBe('/usr/bin/prince');
    expect(options.additionalOptions).toEqual(['--no-network']);
    expect(options.verbose).toBe(true);
  });
});
