/**
 * Build command
 */

import { loadConfig } from '../../core/config.js';
import { build } from '../../core/builder.js';
import { logger } from '../logger.js';

export interface BuildCommandOptions {
  config?: string;
  output?: string;
  verbose?: boolean;
}

/**
 * Execute build command
 */
export async function buildCommand(options: BuildCommandOptions): Promise<void> {
  try {
    // Load config
    const baseConfig = await loadConfig(options.config || process.cwd());

    // Apply CLI overrides without mutating original config
    const config = {
      ...baseConfig,
      output: {
        ...baseConfig.output,
        ...(options.output ? { pdf: options.output } : {}),
      },
      prince: {
        ...baseConfig.prince,
        ...(options.verbose ? { verbose: true } : {}),
      },
    };

    // Run build
    const result = await build(config);

    // Exit with appropriate code
    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
