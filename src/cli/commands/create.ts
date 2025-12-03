/**
 * Create command (scaffold new project)
 */

import { mkdir, writeFile, cp } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { access } from 'node:fs/promises';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface CreateCommandOptions {
  template?: string;
}

/**
 * Execute create command
 */
export async function createCommand(
  projectName: string,
  options: CreateCommandOptions
): Promise<void> {
  try {
    const targetDir = resolve(process.cwd(), projectName);

    // Check if directory already exists
    try {
      await access(targetDir);
      logger.error(`Directory "${projectName}" already exists.`);
      process.exit(1);
    } catch {
      // Directory doesn't exist, good to continue
    }

    logger.crown(`Creating new Crown project: ${projectName}`);

    // Create project directory
    await mkdir(targetDir, { recursive: true });

    // Copy template files
    const templateName = options.template || 'default';
    const templateDir = join(__dirname, '../../../templates', templateName);

    try {
      await access(templateDir);
    } catch {
      logger.error(`Template "${templateName}" not found.`);
      process.exit(1);
    }

    logger.info('Copying template files...');
    await cp(templateDir, targetDir, { recursive: true });

    // Create package.json
    const packageJson = {
      name: projectName,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'crown dev',
        build: 'crown build',
        watch: 'crown watch',
        'preview:html': 'crown preview:html',
        'preview:pdf': 'crown preview:pdf',
      },
      devDependencies: {
        crown: '^0.1.0',
      },
    };

    await writeFile(
      join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf-8'
    );

    // Success message
    logger.success(`Project created at: ${targetDir}`);
    logger.info('');
    logger.info('Next steps:');
    logger.dim(`  cd ${projectName}`);
    logger.dim('  npm install');
    logger.dim('  npm run dev');
    logger.info('');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
