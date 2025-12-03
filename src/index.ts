/**
 * Crown - A modern framework for creating print-quality PDFs with PrinceXML
 * @packageDocumentation
 */

// Core exports
export { loadConfig, resolveConfig, validateEnvironment } from './core/config.js';
export { compileMarkdownFiles, compileMarkdownFile } from './core/markdown.js';
export { TemplateRenderer } from './core/template.js';
export { Builder, build } from './core/builder.js';
export { runPrince, configToPrinceOptions, checkPrinceAvailable } from './core/prince.js';
export { loadData } from './core/data.js';

// Dev server exports
export { startDevServer } from './dev/server.js';
export { Watcher } from './dev/watcher.js';
export { crownPlugin } from './dev/plugin.js';

// Type exports
export type {
  CrownConfig,
  ResolvedCrownConfig,
  ContentFile,
  ContentFrontmatter,
  TemplateContext,
  BuildResult,
} from './types/index.js';

// Helper export
export { defineConfig } from './types/config.js';
