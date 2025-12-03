/**
 * Build pipeline orchestration
 */

import { writeFile, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ResolvedCrownConfig } from '../types/config.js';
import type { BuildResult } from '../types/content.js';
import { compileMarkdownFiles } from './markdown.js';
import { loadData } from './data.js';
import { TemplateRenderer } from './template.js';
import { runPrince, configToPrinceOptions } from './prince.js';
import { ensureDir, measureTime } from './utils.js';

/**
 * Main builder class
 */
export class Builder {
  constructor(private config: ResolvedCrownConfig) {}

  /**
   * Run the complete build pipeline
   */
  async build(): Promise<BuildResult> {
    const startTime = performance.now();

    try {
      console.log('🔨 Building...');

      // 1. Compile markdown content
      console.log('📝 Compiling markdown...');
      const { result: chapters } = await measureTime(() =>
        compileMarkdownFiles(this.config.input.content, this.config.root)
      );
      console.log(`   Found ${chapters.length} content files`);

      // 2. Load data sources
      console.log('📊 Loading data...');
      const data = await loadData(this.config.data, this.config.root);

      // 3. Create template context
      const context = TemplateRenderer.createContext(
        chapters,
        this.config.metadata,
        data
      );

      // 4. Render template
      console.log('🎨 Rendering template...');
      const renderer = new TemplateRenderer(this.config.input.template);
      await renderer.registerPartials();

      // Register custom helpers if provided
      if (this.config.helpers) {
        await renderer.registerCustomHelpers(this.config.helpers);
      }

      const html = await renderer.render(context);

      // 5. Write HTML file
      console.log('💾 Writing HTML...');
      await ensureDir(dirname(this.config.output.html));
      await writeFile(this.config.output.html, html, 'utf-8');

      // 6. Copy styles to output directory
      await this.copyAssets();

      // 7. Generate PDF with Prince
      console.log('📄 Generating PDF...');
      const princeOptions = configToPrinceOptions(this.config);
      const princeResult = await runPrince(
        this.config.output.html,
        this.config.output.pdf,
        princeOptions
      );

      const duration = performance.now() - startTime;

      if (princeResult.success) {
        console.log(`✅ Build complete in ${Math.round(duration)}ms`);
        console.log(`   HTML: ${this.config.output.html}`);
        console.log(`   PDF:  ${this.config.output.pdf}`);

        if (princeResult.warnings.length > 0) {
          console.log(`⚠️  ${princeResult.warnings.length} warnings:`);
          princeResult.warnings.forEach((w) => console.log(`   ${w}`));
        }
      } else {
        console.log('❌ Build failed');
        if (princeResult.errors.length > 0) {
          console.log('Errors:');
          princeResult.errors.forEach((e) => console.log(`   ${e}`));
        }
      }

      return {
        success: princeResult.success,
        htmlPath: this.config.output.html,
        pdfPath: this.config.output.pdf,
        duration,
        contentFiles: chapters.length,
        warnings: princeResult.warnings,
        errors: princeResult.errors,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.log('❌ Build failed');
      console.log(`Error: ${errorMessage}`);

      return {
        success: false,
        htmlPath: this.config.output.html,
        pdfPath: this.config.output.pdf,
        duration,
        contentFiles: 0,
        warnings: [],
        errors: [errorMessage],
      };
    }
  }

  /**
   * Copy assets (styles, images, etc.) to output directory
   */
  private async copyAssets(): Promise<void> {
    const outputDir = dirname(this.config.output.html);

    // Copy main stylesheet
    try {
      const stylesOutput = join(outputDir, 'styles.css');
      await copyFile(this.config.input.styles, stylesOutput);
    } catch (error) {
      console.warn(`Warning: Could not copy styles: ${(error as Error).message}`);
    }

    // TODO: Copy other assets like images, fonts, etc.
    // This could be enhanced to handle asset directories
  }

  /**
   * Build with error recovery (useful for watch mode)
   */
  async buildSafe(): Promise<BuildResult> {
    try {
      return await this.build();
    } catch (error) {
      return {
        success: false,
        htmlPath: this.config.output.html,
        pdfPath: this.config.output.pdf,
        duration: 0,
        contentFiles: 0,
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}

/**
 * Build a project from config
 */
export async function build(config: ResolvedCrownConfig): Promise<BuildResult> {
  const builder = new Builder(config);
  return builder.build();
}
