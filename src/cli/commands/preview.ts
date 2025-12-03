/**
 * Preview commands
 */

import { loadConfig } from '../../core/config.js';
import { logger } from '../logger.js';
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';

/**
 * Preview HTML in browser
 */
export async function previewHtml(configPath?: string): Promise<void> {
  try {
    const config = await loadConfig(configPath || process.cwd());

    // Check if HTML exists
    try {
      await access(config.output.html);
    } catch {
      logger.error('HTML file not found. Run "crown build" first.');
      process.exit(1);
    }

    // Open in default browser
    await openInBrowser(config.output.html);
    logger.success(`Opened HTML: ${config.output.html}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Preview PDF in default viewer
 */
export async function previewPdf(configPath?: string): Promise<void> {
  try {
    const config = await loadConfig(configPath || process.cwd());

    // Check if PDF exists
    try {
      await access(config.output.pdf);
    } catch {
      logger.error('PDF file not found. Run "crown build" first.');
      process.exit(1);
    }

    // Open in default PDF viewer
    await openInBrowser(config.output.pdf);
    logger.success(`Opened PDF: ${config.output.pdf}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Open file in default browser/viewer
 */
async function openInBrowser(path: string): Promise<void> {
  const command = process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
    ? 'start'
    : 'xdg-open';

  return new Promise((resolve, reject) => {
    const child = spawn(command, [path], {
      stdio: 'ignore',
      detached: true,
    });

    child.on('error', reject);
    child.unref();
    resolve();
  });
}
