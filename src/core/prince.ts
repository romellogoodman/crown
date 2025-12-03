/**
 * PrinceXML CLI wrapper
 */

import { spawn } from 'node:child_process';
import type { ResolvedCrownConfig } from '../types/config.js';

export interface PrinceOptions {
  /** Path to Prince executable */
  executablePath: string;
  /** Enable JavaScript */
  javascript?: boolean;
  /** Verbose output */
  verbose?: boolean;
  /** Additional command-line options */
  additionalOptions?: string[];
  /** PDF metadata */
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
  };
}

export interface PrinceResult {
  /** Whether conversion was successful */
  success: boolean;
  /** stdout from Prince */
  stdout: string;
  /** stderr from Prince */
  stderr: string;
  /** Exit code */
  exitCode: number;
  /** Parsed warnings */
  warnings: string[];
  /** Parsed errors */
  errors: string[];
}

/**
 * Run Prince to convert HTML to PDF
 */
export async function runPrince(
  htmlPath: string,
  pdfPath: string,
  options: PrinceOptions
): Promise<PrinceResult> {
  const args = buildPrinceArgs(htmlPath, pdfPath, options);

  return new Promise((resolve) => {
    const prince = spawn(options.executablePath, args);

    let stdout = '';
    let stderr = '';

    prince.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    prince.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    prince.on('close', (exitCode) => {
      const { warnings, errors } = parseOutput(stderr);

      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode: exitCode ?? 1,
        warnings,
        errors,
      });
    });

    prince.on('error', (error) => {
      resolve({
        success: false,
        stdout,
        stderr: error.message,
        exitCode: 1,
        warnings: [],
        errors: [error.message],
      });
    });
  });
}

/**
 * Build command-line arguments for Prince
 */
function buildPrinceArgs(
  htmlPath: string,
  pdfPath: string,
  options: PrinceOptions
): string[] {
  const args: string[] = [];

  // Input file
  args.push(htmlPath);

  // Output file
  args.push('-o', pdfPath);

  // JavaScript
  if (options.javascript) {
    args.push('--javascript');
  }

  // Verbose
  if (options.verbose) {
    args.push('--verbose');
  }

  // Metadata
  if (options.metadata) {
    if (options.metadata.title) {
      args.push('--pdf-title', options.metadata.title);
    }
    if (options.metadata.author) {
      args.push('--pdf-author', options.metadata.author);
    }
    if (options.metadata.subject) {
      args.push('--pdf-subject', options.metadata.subject);
    }
    if (options.metadata.keywords && options.metadata.keywords.length > 0) {
      args.push('--pdf-keywords', options.metadata.keywords.join(', '));
    }
  }

  // Additional options
  if (options.additionalOptions) {
    args.push(...options.additionalOptions);
  }

  return args;
}

/**
 * Parse Prince output for warnings and errors
 */
function parseOutput(output: string): { warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  const lines = output.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes('warning:')) {
      warnings.push(trimmed);
    } else if (trimmed.includes('error:')) {
      errors.push(trimmed);
    }
  }

  return { warnings, errors };
}

/**
 * Convert config to Prince options
 */
export function configToPrinceOptions(config: ResolvedCrownConfig): PrinceOptions {
  return {
    executablePath: config.prince.executablePath,
    javascript: config.prince.javascript,
    verbose: config.prince.verbose,
    additionalOptions: config.prince.options,
    metadata: {
      title: config.metadata.title,
      author: config.metadata.author,
      subject: config.metadata.subject,
      keywords: config.metadata.keywords,
    },
  };
}

/**
 * Check if Prince is available
 */
export async function checkPrinceAvailable(
  executablePath: string = 'prince'
): Promise<boolean> {
  try {
    const result = await runPrince('', '', {
      executablePath,
      additionalOptions: ['--version'],
    });
    return result.success || result.stdout.includes('Prince');
  } catch {
    return false;
  }
}
