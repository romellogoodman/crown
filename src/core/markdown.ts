/**
 * Markdown compilation with frontmatter support
 */

import { marked, type MarkedExtension } from 'marked';
import matter from 'gray-matter';
import { readFile } from 'node:fs/promises';
import { glob } from 'glob';
import { relative, resolve } from 'node:path';
import type { ContentFile, ContentFrontmatter } from '../types/content.js';
import { sortByOrder } from './utils.js';

export interface MarkdownOptions {
  gfm?: boolean;
  breaks?: boolean;
  extensions?: string[];
}

/**
 * Configure marked with options and optional extensions
 */
async function configureMarked(options: MarkdownOptions = {}): Promise<void> {
  marked.setOptions({
    gfm: options.gfm ?? true,
    breaks: options.breaks ?? false,
  });

  // Load and apply custom extensions
  if (options.extensions && options.extensions.length > 0) {
    for (const extPath of options.extensions) {
      try {
        const extModule = await import(resolve(extPath));
        const extension: MarkedExtension = extModule.default || extModule;
        marked.use(extension);
      } catch (error) {
        console.warn(
          `Warning: Failed to load marked extension from ${extPath}: ${(error as Error).message}`
        );
      }
    }
  }
}

/**
 * Compile all markdown files matching a glob pattern
 */
export async function compileMarkdownFiles(
  pattern: string,
  root: string,
  markdownOptions?: MarkdownOptions
): Promise<ContentFile[]> {
  // Configure marked with provided options
  await configureMarked(markdownOptions);

  // Find all matching markdown files
  const files = await glob(pattern, {
    cwd: root,
    absolute: true,
    nodir: true,
  });

  if (files.length === 0) {
    console.warn(`Warning: No content files found matching pattern: ${pattern}`);
    return [];
  }

  // Compile each file
  const contentFiles = await Promise.all(
    files.map((filePath) => compileMarkdownFile(filePath, root))
  );

  // Sort by order
  return sortByOrder(contentFiles);
}

/**
 * Validate and coerce frontmatter data to ContentFrontmatter
 */
function validateFrontmatter(
  data: Record<string, unknown>,
  filePath: string
): ContentFrontmatter {
  const frontmatter: ContentFrontmatter = { ...data };

  // Validate known fields have correct types
  if ('order' in data && typeof data.order !== 'number') {
    console.warn(
      `Warning: Invalid "order" in ${filePath} (expected number, got ${typeof data.order}). Ignoring.`
    );
    delete frontmatter.order;
  }

  if ('title' in data && typeof data.title !== 'string') {
    console.warn(
      `Warning: Invalid "title" in ${filePath} (expected string, got ${typeof data.title}). Converting to string.`
    );
    frontmatter.title = String(data.title);
  }

  if ('tags' in data && !Array.isArray(data.tags)) {
    console.warn(
      `Warning: Invalid "tags" in ${filePath} (expected array). Ignoring.`
    );
    delete frontmatter.tags;
  }

  if ('id' in data && typeof data.id !== 'string') {
    console.warn(
      `Warning: Invalid "id" in ${filePath} (expected string, got ${typeof data.id}). Converting to string.`
    );
    frontmatter.id = String(data.id);
  }

  return frontmatter;
}

/**
 * Compile a single markdown file
 */
export async function compileMarkdownFile(
  filePath: string,
  root: string
): Promise<ContentFile> {
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read content file ${filePath}: ${(error as Error).message}`);
  }

  // Parse frontmatter with error recovery
  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    content = parsed.content;
  } catch (error) {
    console.warn(
      `Warning: Invalid frontmatter in ${filePath}: ${(error as Error).message}. Treating entire file as content.`
    );
    data = {};
    content = raw;
  }

  // Validate frontmatter
  const frontmatter = validateFrontmatter(data, filePath);

  // Compile markdown to HTML
  const html = await marked(content);

  return {
    path: relative(root, filePath),
    absolutePath: filePath,
    frontmatter,
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
