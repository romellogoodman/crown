/**
 * Content-related type definitions
 */

/**
 * Parsed markdown content with frontmatter
 */
export interface ContentFile {
  /** File path relative to content directory */
  path: string;
  /** Absolute file path */
  absolutePath: string;
  /** Parsed frontmatter data */
  frontmatter: ContentFrontmatter;
  /** Rendered HTML content */
  html: string;
  /** Raw markdown content */
  raw: string;
}

/**
 * Frontmatter schema for content files
 */
export interface ContentFrontmatter {
  /** Content title */
  title?: string;
  /** Content subtitle */
  subtitle?: string;
  /** Author name (can override book author) */
  author?: string;
  /** Unique ID for cross-references */
  id?: string;
  /** Order/sequence number for sorting */
  order?: number;
  /** Tags for categorization */
  tags?: string[];
  /** Additional custom fields */
  [key: string]: unknown;
}

/**
 * Template context passed to Handlebars
 */
export interface TemplateContext {
  /** Book metadata from config */
  metadata: {
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    lang: string;
  };
  /** Parsed content files */
  chapters: ContentFile[];
  /** Additional data from data sources */
  data: Record<string, unknown>;
  /** Current date */
  generatedDate: Date;
}

/**
 * Build result information
 */
export interface BuildResult {
  /** Whether build was successful */
  success: boolean;
  /** HTML file path */
  htmlPath: string;
  /** PDF file path */
  pdfPath: string;
  /** Build duration in milliseconds */
  duration: number;
  /** Number of content files processed */
  contentFiles: number;
  /** Any warnings */
  warnings: string[];
  /** Any errors */
  errors: string[];
}
