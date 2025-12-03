/**
 * Watch command (build on file changes without dev server)
 */

import { loadConfig } from '../../core/config.js';
import { Builder } from '../../core/builder.js';
import { Watcher } from '../../dev/watcher.js';
import { logger } from '../logger.js';

export interface WatchCommandOptions {
  config?: string;
}

/**
 * Execute watch command
 */
export async function watchCommand(options: WatchCommandOptions): Promise<void> {
  try {
    // Load config
    const config = await loadConfig(options.config || process.cwd());

    // Initial build
    logger.info('Running initial build...');
    const builder = new Builder(config);
    await builder.build();

    // Start watching
    const watcher = new Watcher(config, async (event) => {
      logger.info(`File changed: ${event.path}`);

      if (event.type === 'config') {
        logger.warn('Config changed. Please restart watch mode.');
        return;
      }

      await builder.buildSafe();
    });

    await watcher.start();

    // Keep process alive
    process.on('SIGINT', async () => {
      logger.info('Stopping watch mode...');
      await watcher.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
