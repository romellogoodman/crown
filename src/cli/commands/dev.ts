/**
 * Dev command
 */

import { loadConfig } from '../../core/config.js';
import { startDevServer } from '../../dev/server.js';
import { logger } from '../logger.js';

export interface DevCommandOptions {
  config?: string;
  port?: number;
  host?: string;
  open?: boolean;
  noOpen?: boolean;
}

/**
 * Execute dev command
 */
export async function devCommand(options: DevCommandOptions): Promise<void> {
  try {
    // Load config
    const baseConfig = await loadConfig(options.config || process.cwd());

    // Apply CLI overrides without mutating original config
    const config = {
      ...baseConfig,
      devServer: {
        ...baseConfig.devServer,
        ...(options.port !== undefined ? { port: options.port } : {}),
        ...(options.host !== undefined ? { host: options.host } : {}),
      },
    };

    const open = options.noOpen ? false : options.open ?? config.devServer.open;

    // Start dev server
    await startDevServer(config, { open });

    // Keep process alive
    process.on('SIGINT', () => {
      logger.info('Shutting down dev server...');
      process.exit(0);
    });
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
