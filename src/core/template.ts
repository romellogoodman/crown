/**
 * Handlebars template rendering
 */

import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import { dirname, join, basename, extname, resolve } from 'node:path';
import { glob } from 'glob';
import type { TemplateContext } from '../types/content.js';
import { createMarkdownHelper } from './markdown.js';

/**
 * Template renderer with Handlebars
 */
export class TemplateRenderer {
  private handlebars: typeof Handlebars;
  private templatePath: string;
  private templateDir: string;

  constructor(templatePath: string) {
    this.handlebars = Handlebars.create();
    this.templatePath = templatePath;
    this.templateDir = dirname(templatePath);

    // Register built-in helpers
    this.registerBuiltInHelpers();
  }

  /**
   * Register built-in Handlebars helpers
   */
  private registerBuiltInHelpers(): void {
    // Markdown inline helper
    this.handlebars.registerHelper('markdown', createMarkdownHelper());

    // JSON stringify helper
    this.handlebars.registerHelper('json', (context: unknown) => {
      return JSON.stringify(context, null, 2);
    });

    // Date formatting helper
    this.handlebars.registerHelper('formatDate', (date: Date, format?: string) => {
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      if (format === 'iso') {
        return date.toISOString();
      }
      return date.toLocaleDateString();
    });

    // Equality helper
    this.handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
      return a === b;
    });

    // Conditional helpers
    this.handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    this.handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    this.handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
    this.handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

    // Array helpers
    this.handlebars.registerHelper('length', (arr: unknown[]) => arr?.length ?? 0);
    this.handlebars.registerHelper('join', (arr: unknown[], separator = ', ') => {
      return arr?.join(separator) ?? '';
    });
  }

  /**
   * Load and register all partials from the templates directory
   */
  async registerPartials(): Promise<void> {
    const partialsDir = join(this.templateDir, 'partials');

    try {
      const partialFiles = await glob('**/*.{html,hbs}', {
        cwd: partialsDir,
        absolute: true,
      });

      for (const file of partialFiles) {
        const content = await readFile(file, 'utf-8');
        const name = this.getPartialName(file, partialsDir);
        this.handlebars.registerPartial(name, content);
      }
    } catch (error) {
      // Partials directory might not exist, that's okay
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get partial name from file path
   */
  private getPartialName(filePath: string, partialsDir: string): string {
    const relativePath = filePath.substring(partialsDir.length + 1);
    const name = relativePath.replace(/\\/g, '/'); // Normalize path separators
    return basename(name, extname(name));
  }

  /**
   * Load custom helpers from a JavaScript file
   */
  async registerCustomHelpers(helpersPath: string): Promise<void> {
    try {
      // Use dynamic import for ES modules
      const helpersModule = await import(resolve(helpersPath));
      const helpers = helpersModule.default || helpersModule;

      if (typeof helpers === 'object') {
        for (const [name, helper] of Object.entries(helpers)) {
          if (typeof helper === 'function') {
            this.handlebars.registerHelper(name, helper as Handlebars.HelperDelegate);
          }
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to load custom helpers from ${helpersPath}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Render the template with context
   */
  async render(context: TemplateContext): Promise<string> {
    // Load main template
    const templateSource = await readFile(this.templatePath, 'utf-8');

    // Compile and render
    const template = this.handlebars.compile(templateSource);
    return template(context);
  }

  /**
   * Create a template context from content and metadata
   */
  static createContext(
    chapters: TemplateContext['chapters'],
    metadata: TemplateContext['metadata'],
    data: Record<string, unknown> = {}
  ): TemplateContext {
    return {
      metadata,
      chapters,
      data,
      generatedDate: new Date(),
    };
  }
}
