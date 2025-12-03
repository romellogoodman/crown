/**
 * Shared utility functions
 */

import { resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

/**
 * Resolve a path relative to a base directory
 */
export function resolvePath(base: string, target: string): string {
  return isAbsolute(target) ? target : resolve(base, target);
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/**
 * Get the directory name from a file URL (for ES modules)
 */
export function getDirname(url: string): string {
  return dirname(fileURLToPath(url));
}

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Sort content files by order property or filename
 */
export function sortByOrder<T extends { frontmatter: { order?: number }; path: string }>(
  items: T[]
): T[] {
  return items.sort((a, b) => {
    // Sort by order if both have it
    if (a.frontmatter.order !== undefined && b.frontmatter.order !== undefined) {
      return a.frontmatter.order - b.frontmatter.order;
    }
    // Items with order come before items without
    if (a.frontmatter.order !== undefined) return -1;
    if (b.frontmatter.order !== undefined) return 1;
    // Otherwise sort by filename
    return a.path.localeCompare(b.path);
  });
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
