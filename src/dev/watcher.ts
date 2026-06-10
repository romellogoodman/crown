/**
 * File watching system
 */

import chokidar, { FSWatcher } from 'chokidar';
import { dirname } from 'node:path';
import type { ResolvedCrownConfig } from '../types/config.js';
import { debounce } from '../core/utils.js';

export type WatchEventType = 'content' | 'template' | 'style' | 'config' | 'helper';

export interface WatchEvent {
  type: WatchEventType;
  path: string;
  event: 'add' | 'change' | 'unlink';
}

export type WatchCallback = (event: WatchEvent) => void | Promise<void>;

/**
 * File watcher for Crown projects
 */
export class Watcher {
  private watcher: FSWatcher | null = null;
  private callback: WatchCallback;
  private config: ResolvedCrownConfig;

  constructor(config: ResolvedCrownConfig, callback: WatchCallback) {
    this.config = config;
    this.callback = debounce(callback, 300); // Debounce to avoid rapid rebuilds
  }

  /**
   * Start watching files
   */
  async start(): Promise<void> {
    const watchPaths = this.getWatchPaths();

    this.watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
      // chokidar v4+ no longer supports glob patterns, so we watch
      // directories/files and filter events by relevance below.
      ignored: (path: string) =>
        /(^|[/\\])(node_modules|\.git)([/\\]|$)/.test(path) ||
        this.isOutputPath(path),
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('add', (path) => this.handleChange('add', path));
    this.watcher.on('change', (path) => this.handleChange('change', path));
    this.watcher.on('unlink', (path) => this.handleChange('unlink', path));
    this.watcher.on('error', (error: unknown) => {
      console.error(`File watcher error: ${error instanceof Error ? error.message : String(error)}`);
    });

    console.log('👀 Watching for changes...');
  }

  /**
   * Stop watching
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Get all paths to watch (directories and individual files — no globs)
   */
  private getWatchPaths(): string[] {
    const paths: string[] = [];

    // Content and template directories (recursive); events are filtered by
    // extension in getEventType.
    paths.push(dirname(this.config.input.content));
    paths.push(dirname(this.config.input.template));

    // Styles file
    paths.push(this.config.input.styles);

    // Project root so config files (crown.config.*) are picked up
    paths.push(this.config.root);

    // Custom helpers
    if (this.config.helpers) {
      paths.push(this.config.helpers);
    }

    return paths;
  }

  /**
   * Whether a path lives inside a build output directory (avoids rebuild loops)
   */
  private isOutputPath(path: string): boolean {
    const outputDirs = [
      dirname(this.config.output.html),
      dirname(this.config.output.pdf),
    ];
    return outputDirs.some((dir) => path === dir || path.startsWith(dir + '/'));
  }

  /**
   * Handle file change event
   */
  private handleChange(
    event: 'add' | 'change' | 'unlink',
    path: string
  ): void {
    const type = this.getEventType(path);

    // Ignore files that aren't relevant content/template/style/config/helper
    if (type === null) {
      return;
    }

    this.callback({
      type,
      path,
      event,
    });
  }

  /**
   * Determine event type from file path, or null if the file is irrelevant
   */
  private getEventType(path: string): WatchEventType | null {
    if (this.config.helpers && path === this.config.helpers) {
      return 'helper';
    }
    if (/(^|[/\\])crown\.config\.(js|ts|json|mjs|cjs)$/.test(path)) {
      return 'config';
    }
    if (path.endsWith('.md')) {
      return 'content';
    }
    if (path.endsWith('.html') || path.endsWith('.hbs')) {
      return 'template';
    }
    if (path.endsWith('.css') || path.endsWith('.scss')) {
      return 'style';
    }
    return null;
  }
}
