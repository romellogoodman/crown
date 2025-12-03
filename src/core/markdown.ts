/**
 * Markdown compilation with frontmatter support
 */

import { marked } from 'marked';
import matter from 'gray-matter';
import { readFile } from 'node:fs/promises';
import { glob } from 'glob';
import { relative } from 'node:path';
import type { ContentFile, ContentFrontmatter } from '../types/content.js';
import { sortByOrder } from './utils.js';

/**
 * Configure marked with sensible defaults
 */
function configureMarked(): void {
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Don't convert \n to <br>
  });
}

// Configure marked on module load
configureMarked();

/**
 * Compile all markdown files matching a glob pattern
 */
export async function compileMarkdownFiles(
  pattern: string,
  root: string
): Promise<ContentFile[]> {
  // Find all matching markdown files
  const files = await glob(pattern, {
    cwd: root,
    absolute: true,
    nodir: true,
  });

  if (files.length === 0) {
    throw new Error(`No content files found matching pattern: ${pattern}`);
  }

  // Compile each file
  const contentFiles = await Promise.all(
    files.map((filePath) => compileMarkdownFile(filePath, root))
  );

  // Sort by order
  return sortByOrder(contentFiles);
}

/**
 * Compile a single markdown file
 */
export async function compileMarkdownFile(
  filePath: string,
  root: string
): Promise<ContentFile> {
  const raw = await readFile(filePath, 'utf-8');

  // Parse frontmatter
  const { data, content } = matter(raw);

  // Compile markdown to HTML
  const html = await marked(content);

  return {
    path: relative(root, filePath),
    absolutePath: filePath,
    frontmatter: data as ContentFrontmatter,
    html,
    raw: content,
  };
}

/**
 * Add custom Handlebars helper for rendering markdown inline
 */
export function createMarkdownHelper(): (text: string) => string {
  return (text: string) => {
    return marked.parseInline(text) as string;
  };
}
