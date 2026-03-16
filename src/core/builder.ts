/**
 * Build pipeline orchestration
 */

import { writeFile, readFile, copyFile, cp, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { glob } from 'glob';
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
        compileMarkdownFiles(this.config.input.content, this.config.root, this.config.markdown)
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
   * Generate @page CSS from config
   */
  private generatePageCSS(): string {
    const { size, margins } = this.config.page;
    const parts: string[] = [];

    parts.push(`  size: ${size};`);

    // Use inside/outside for facing pages, or top/right/bottom/left
    if (margins.inside !== undefined && margins.outside !== undefined) {
      parts.push(`  margin-top: ${margins.top};`);
      parts.push(`  margin-bottom: ${margins.bottom};`);
      parts.push(`  margin-inside: ${margins.inside};`);
      parts.push(`  margin-outside: ${margins.outside};`);
    } else {
      parts.push(`  margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};`);
    }

    return `@page {\n${parts.join('\n')}\n}\n`;
  }

  /**
   * Copy assets (styles, images, fonts, etc.) to output directory
   */
  private async copyAssets(): Promise<void> {
    const outputDir = dirname(this.config.output.html);

    // Copy main stylesheet with @page injection from config
    try {
      const stylesOutput = join(outputDir, 'styles.css');
      let stylesContent = await readFile(this.config.input.styles, 'utf-8');

      // Inject @page rule from config if not already present in the stylesheet
      if (!/@page\s*\{/.test(stylesContent)) {
        stylesContent = this.generatePageCSS() + '\n' + stylesContent;
      }

      await writeFile(stylesOutput, stylesContent, 'utf-8');
    } catch (error) {
      console.warn(`Warning: Could not copy styles: ${(error as Error).message}`);
    }

    // Copy asset directories (images, fonts) from content and template dirs
    const contentDir = dirname(this.config.input.content);
    const templateDir = dirname(this.config.input.template);
    const assetPatterns = '**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,otf,eot}';

    for (const sourceDir of [contentDir, templateDir]) {
      try {
        const resolvedDir = resolve(this.config.root, sourceDir);
        const assets = await glob(assetPatterns, {
          cwd: resolvedDir,
          absolute: true,
          nodir: true,
        });

        for (const asset of assets) {
          const relativePath = asset.substring(resolvedDir.length + 1);
          const destPath = join(outputDir, relativePath);
          await ensureDir(dirname(destPath));
          await copyFile(asset, destPath);
        }
      } catch {
        // Directory may not exist, that's fine
      }
    }

    // Copy config-specified assets directory if provided
    if (this.config.input.assets) {
      try {
        const assetsStat = await stat(this.config.input.assets);
        if (assetsStat.isDirectory()) {
          // Copy to output root (preserving directory name)
          const dirName = this.config.input.assets.split('/').pop() || 'assets';
          const destDir = join(outputDir, dirName);
          await ensureDir(destDir);
          await cp(this.config.input.assets, destDir, { recursive: true });
        }
      } catch {
        // Assets directory doesn't exist, that's fine
      }
    }

    // Copy root-level assets directory if it exists (legacy behavior)
    const assetsDir = join(this.config.root, 'assets');
    try {
      const assetsStat = await stat(assetsDir);
      if (assetsStat.isDirectory()) {
        const destAssetsDir = join(outputDir, 'assets');
        await ensureDir(destAssetsDir);
        await cp(assetsDir, destAssetsDir, { recursive: true });
      }
    } catch {
      // No assets directory, that's fine
    }
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
