/**
 * Configuration loading and validation
 */

import { cosmiconfig } from 'cosmiconfig';
import { resolve, dirname } from 'node:path';
import type { CrownConfig, ResolvedCrownConfig } from '../types/config.js';

const MODULE_NAME = 'crown';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Omit<ResolvedCrownConfig, 'input' | 'output' | 'root'> = {
  metadata: {
    title: 'Untitled Book',
    author: 'Unknown Author',
    subject: '',
    keywords: [],
    lang: 'en',
  },
  page: {
    size: 'A4',
    margins: {
      top: '2cm',
      bottom: '2cm',
      left: '2cm',
      right: '2cm',
      inside: '2cm',
      outside: '2cm',
    },
  },
  prince: {
    javascript: true,
    verbose: false,
    options: [],
    executablePath: 'prince',
  },
  devServer: {
    port: 3000,
    host: 'localhost',
    open: true,
  },
  data: {},
  helpers: null,
};

/**
 * Load Crown configuration from the project
 */
export async function loadConfig(
  searchFrom: string = process.cwd()
): Promise<ResolvedCrownConfig> {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      'crown.config.js',
      'crown.config.mjs',
      'crown.config.cjs',
      'crown.config.ts',
      'crown.config.json',
      '.crownrc',
      '.crownrc.json',
      'package.json',
    ],
  });

  const result = await explorer.search(searchFrom);

  if (!result || !result.config) {
    throw new Error(
      `No Crown configuration found. Please create a crown.config.js file.`
    );
  }

  const userConfig = result.config as CrownConfig;
  const configDir = dirname(result.filepath);

  return resolveConfig(userConfig, configDir);
}

/**
 * Resolve and validate user configuration with defaults
 */
export function resolveConfig(
  userConfig: CrownConfig,
  root: string
): ResolvedCrownConfig {
  // Validate required fields
  if (!userConfig.input) {
    throw new Error('Configuration error: "input" is required');
  }
  if (!userConfig.input.content) {
    throw new Error('Configuration error: "input.content" is required');
  }
  if (!userConfig.input.template) {
    throw new Error('Configuration error: "input.template" is required');
  }
  if (!userConfig.input.styles) {
    throw new Error('Configuration error: "input.styles" is required');
  }
  if (!userConfig.output) {
    throw new Error('Configuration error: "output" is required');
  }
  if (!userConfig.output.html) {
    throw new Error('Configuration error: "output.html" is required');
  }
  if (!userConfig.output.pdf) {
    throw new Error('Configuration error: "output.pdf" is required');
  }

  // Merge with defaults
  const resolved: ResolvedCrownConfig = {
    input: {
      content: resolvePathFromRoot(root, userConfig.input.content),
      template: resolvePathFromRoot(root, userConfig.input.template),
      styles: resolvePathFromRoot(root, userConfig.input.styles),
    },
    output: {
      html: resolvePathFromRoot(root, userConfig.output.html),
      pdf: resolvePathFromRoot(root, userConfig.output.pdf),
    },
    metadata: {
      ...DEFAULT_CONFIG.metadata,
      ...userConfig.metadata,
    },
    page: {
      size: userConfig.page?.size ?? DEFAULT_CONFIG.page.size,
      margins: {
        top: userConfig.page?.margins?.top ?? DEFAULT_CONFIG.page.margins!.top,
        bottom: userConfig.page?.margins?.bottom ?? DEFAULT_CONFIG.page.margins!.bottom,
        left: userConfig.page?.margins?.left ?? DEFAULT_CONFIG.page.margins!.left,
        right: userConfig.page?.margins?.right ?? DEFAULT_CONFIG.page.margins!.right,
        inside: userConfig.page?.margins?.inside ?? DEFAULT_CONFIG.page.margins!.inside,
        outside: userConfig.page?.margins?.outside ?? DEFAULT_CONFIG.page.margins!.outside,
      },
    },
    prince: {
      ...DEFAULT_CONFIG.prince,
      ...userConfig.prince,
    },
    devServer: {
      ...DEFAULT_CONFIG.devServer,
      ...userConfig.devServer,
    },
    data: userConfig.data ?? {},
    helpers: userConfig.helpers ? resolvePathFromRoot(root, userConfig.helpers) : null,
    root,
  };

  return resolved;
}

/**
 * Resolve a path relative to the config root, unless it's already absolute
 */
function resolvePathFromRoot(root: string, path: string): string {
  return resolve(root, path);
}

/**
 * Validate that required dependencies are available
 */
export async function validateEnvironment(): Promise<void> {
  // Check if Prince is available
  const { execSync } = await import('node:child_process');
  try {
    execSync('prince --version', { stdio: 'ignore' });
  } catch {
    throw new Error(
      'PrinceXML is not installed or not in PATH. Please install PrinceXML from https://www.princexml.com/download/'
    );
  }
}
