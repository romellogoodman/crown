/**
 * File watching system
 */

import chokidar, { FSWatcher } from 'chokidar';
import { join, dirname } from 'node:path';
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
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('add', (path) => this.handleChange('add', path));
    this.watcher.on('change', (path) => this.handleChange('change', path));
    this.watcher.on('unlink', (path) => this.handleChange('unlink', path));

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
   * Get all paths to watch
   */
  private getWatchPaths(): string[] {
    const paths: string[] = [];

    // Content directory
    const contentDir = dirname(this.config.input.content);
    paths.push(join(contentDir, '**/*.md'));

    // Template directory
    const templateDir = dirname(this.config.input.template);
    paths.push(join(templateDir, '**/*.{html,hbs}'));

    // Styles
    paths.push(this.config.input.styles);

    // Config file
    paths.push(join(this.config.root, 'crown.config.{js,ts,json,mjs,cjs}'));

    // Custom helpers
    if (this.config.helpers) {
      paths.push(this.config.helpers);
    }

    return paths;
  }

  /**
   * Handle file change event
   */
  private handleChange(
    event: 'add' | 'change' | 'unlink',
    path: string
  ): void {
    const type = this.getEventType(path);

    this.callback({
      type,
      path,
      event,
    });
  }

  /**
   * Determine event type from file path
   */
  private getEventType(path: string): WatchEventType {
    if (path.endsWith('.md')) {
      return 'content';
    }
    if (path.endsWith('.html') || path.endsWith('.hbs')) {
      return 'template';
    }
    if (path.endsWith('.css') || path.endsWith('.scss')) {
      return 'style';
    }
    if (path.includes('crown.config')) {
      return 'config';
    }
    if (this.config.helpers && path === this.config.helpers) {
      return 'helper';
    }
    return 'content'; // Default
  }
}
