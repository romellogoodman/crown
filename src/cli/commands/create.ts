/**
 * Create command (scaffold new project)
 */

import { mkdir, writeFile, cp, readdir } from 'node:fs/promises';
import { join, resolve, dirname, basename } from 'node:path';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find the templates directory by checking multiple possible locations
async function findTemplatesDir(): Promise<string> {
  const possiblePaths = [
    // When running from compiled dist (dist/commands/ -> templates/)
    join(__dirname, '../../templates'),
    // When running from source (src/cli/commands/ -> templates/)
    join(__dirname, '../../../templates'),
    // When installed as a package
    join(__dirname, '../templates'),
  ];

  // Also try resolving from the package root via require.resolve
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve('crown/package.json');
    possiblePaths.push(join(dirname(pkgPath), 'templates'));
  } catch {
    // Not installed as a package, that's fine
  }

  for (const path of possiblePaths) {
    try {
      await access(path);
      logger.dim(`  Using templates from: ${path}`);
      return path;
    } catch {
      // Continue to next path
    }
  }

  throw new Error(
    `Could not find templates directory. Searched:\n${possiblePaths.map((p) => `  - ${p}`).join('\n')}`
  );
}

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
    const isCurrentDir = projectName === '.';
    const targetDir = isCurrentDir
      ? process.cwd()
      : resolve(process.cwd(), projectName);

    if (isCurrentDir) {
      // Check if current directory is empty (allow some common files)
      const allowedFiles = new Set(['.git', '.gitignore', 'README.md', '.DS_Store', 'Thumbs.db', 'desktop.ini']);

      try {
        const files = await readdir(targetDir);
        const nonAllowedFiles = files.filter(f => !allowedFiles.has(f));

        if (nonAllowedFiles.length > 0) {
          logger.error('Current directory is not empty. Crown can only initialize in an empty directory.');
          logger.error('Found files/folders: ' + nonAllowedFiles.join(', '));
          process.exit(1);
        }
      } catch {
        // Directory doesn't exist or can't be read - that's ok for non-current-dir case
        if (!isCurrentDir) {
          // Will be created below
        }
      }

      logger.crown(`Initializing Crown project in current directory`);
    } else {
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
    }

    // Copy template files
    const templateName = options.template || 'default';
    const templatesBaseDir = await findTemplatesDir();
    const templateDir = join(templatesBaseDir, templateName);

    try {
      await access(templateDir);
    } catch {
      logger.error(`Template "${templateName}" not found at ${templateDir}`);
      process.exit(1);
    }

    logger.info('Copying template files...');
    await cp(templateDir, targetDir, { recursive: true });

    // Create package.json
    const projectDirName = isCurrentDir ? basename(targetDir) : projectName;
    const packageJson = {
      name: projectDirName,
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
    if (isCurrentDir) {
      logger.success(`Crown project initialized in current directory`);
      logger.info('');
      logger.info('Next steps:');
      logger.dim('  npm install');
      logger.dim('  npm run dev');
    } else {
      logger.success(`Project created at: ${targetDir}`);
      logger.info('');
      logger.info('Next steps:');
      logger.dim(`  cd ${projectName}`);
      logger.dim('  npm install');
      logger.dim('  npm run dev');
    }
    logger.info('');
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
