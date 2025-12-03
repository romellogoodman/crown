#!/usr/bin/env node

/**
 * Crown CLI entry point
 */

import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCommand } from './commands/build.js';
import { devCommand } from './commands/dev.js';
import { watchCommand } from './commands/watch.js';
import { previewHtml, previewPdf } from './commands/preview.js';
import { createCommand } from './commands/create.js';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read package.json for version
let packageJson: any;
try {
  const packageJsonPath = join(__dirname, '../package.json');
  packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
} catch {
  // Fallback if running from source
  packageJson = { version: '0.1.0' };
}

// Create program
const program = new Command();

program
  .name('crown')
  .description('A modern framework for creating print-quality PDFs with PrinceXML')
  .version(packageJson.version);

// Create command
program
  .command('create <project-name>')
  .description('Create a new Crown project')
  .option('-t, --template <name>', 'Template to use', 'default')
  .action(async (projectName, options) => {
    await createCommand(projectName, options);
  });

// Dev command
program
  .command('dev')
  .description('Start development server with hot reload')
  .option('-c, --config <path>', 'Path to config file')
  .option('-p, --port <port>', 'Port to run dev server on', parseInt)
  .option('--host <host>', 'Host to run dev server on')
  .option('--open', 'Open browser automatically')
  .option('--no-open', 'Do not open browser')
  .action(async (options) => {
    await devCommand(options);
  });

// Build command
program
  .command('build')
  .description('Build PDF for production')
  .option('-c, --config <path>', 'Path to config file')
  .option('-o, --output <path>', 'Output PDF path')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    await buildCommand(options);
  });

// Watch command
program
  .command('watch')
  .description('Watch and rebuild on file changes (without dev server)')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    await watchCommand(options);
  });

// Preview commands
program
  .command('preview:html')
  .description('Open generated HTML in browser')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    await previewHtml(options.config);
  });

program
  .command('preview:pdf')
  .description('Open generated PDF in default viewer')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options) => {
    await previewPdf(options.config);
  });

// Parse arguments
try {
  await program.parseAsync(process.argv);
} catch (error) {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
