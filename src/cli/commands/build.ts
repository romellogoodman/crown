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
    const config = await loadConfig(options.config || process.cwd());

    // Override output if specified
    if (options.output) {
      config.output.pdf = options.output;
    }

    // Override verbose if specified
    if (options.verbose) {
      config.prince.verbose = true;
    }

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
