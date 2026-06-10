/**
 * Doctor command — checks that the environment is ready to build
 */

import { loadConfig } from '../../core/config.js';
import { checkPrinceAvailable } from '../../core/prince.js';
import { logger } from '../logger.js';

export interface DoctorCommandOptions {
  config?: string;
}

/**
 * Execute doctor command
 */
export async function doctorCommand(options: DoctorCommandOptions): Promise<void> {
  logger.info('Running Crown environment checks...');
  logger.info('');

  let ok = true;

  // Node.js version
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (Number.isFinite(nodeMajor) && nodeMajor >= 18) {
    logger.success(`Node.js ${process.versions.node}`);
  } else {
    ok = false;
    logger.error(`Node.js ${process.versions.node} (Crown requires Node.js 18 or newer)`);
  }

  // Resolve the configured Prince executable, if a config is present
  let executablePath = 'prince';
  try {
    const config = await loadConfig(options.config || process.cwd());
    executablePath = config.prince.executablePath;
    logger.success('Found Crown configuration');
  } catch {
    logger.dim('No Crown configuration found (using default "prince" executable)');
  }

  // PrinceXML availability
  const princeAvailable = await checkPrinceAvailable(executablePath);
  if (princeAvailable) {
    logger.success(`PrinceXML available (${executablePath})`);
  } else {
    ok = false;
    logger.error(
      `PrinceXML not found (${executablePath}). Install it from https://www.princexml.com/download/`
    );
  }

  logger.info('');
  if (ok) {
    logger.success('All checks passed. You are ready to build.');
  } else {
    logger.error('Some checks failed. See messages above.');
    process.exit(1);
  }
}
