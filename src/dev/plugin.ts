/**
 * Vite plugin for Crown
 */

import type { Plugin, ViteDevServer } from 'vite';
import type { ResolvedCrownConfig } from '../types/config.js';
import { Builder } from '../core/builder.js';
import { Watcher, type WatchEvent } from './watcher.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Create Crown Vite plugin
 */
export function crownPlugin(config: ResolvedCrownConfig): Plugin {
  let server: ViteDevServer | null = null;
  let watcher: Watcher | null = null;
  let isBuilding = false;

  return {
    name: 'vite-plugin-crown',

    configureServer(viteServer) {
      server = viteServer;

      // Serve the preview page at root
      viteServer.middlewares.use(async (req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          const previewHtml = await readFile(
            join(__dirname, 'preview.html'),
            'utf-8'
          );
          res.setHeader('Content-Type', 'text/html');
          res.end(previewHtml);
          return;
        }

        // Serve the generated PDF
        if (req.url?.startsWith('/book.pdf')) {
          try {
            const pdfContent = await readFile(config.output.pdf);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(pdfContent);
          } catch {
            res.statusCode = 404;
            res.end('PDF not found. Building...');
          }
          return;
        }

        next();
      });

      // Set up file watcher
      watcher = new Watcher(config, async (event) => {
        await handleFileChange(event, server!, config);
      });

      // Start watching after server is ready
      viteServer.httpServer?.once('listening', async () => {
        // Do initial build
        await buildAndNotify(server!, config);
        // Start watching
        await watcher?.start();
      });
    },

    async buildEnd() {
      if (watcher) {
        await watcher.stop();
      }
    },
  };

  async function handleFileChange(
    event: WatchEvent,
    server: ViteDevServer,
    config: ResolvedCrownConfig
  ): Promise<void> {
    if (isBuilding) {
      return; // Skip if already building
    }

    console.log(`\n📝 File changed: ${event.path}`);

    // Config changes require server restart
    if (event.type === 'config') {
      console.log('⚠️  Config changed. Please restart the dev server.');
      return;
    }

    await buildAndNotify(server, config);
  }

  async function buildAndNotify(
    server: ViteDevServer,
    config: ResolvedCrownConfig
  ): Promise<void> {
    if (isBuilding) return;

    isBuilding = true;

    try {
      // Notify clients that build is starting
      server.ws.send('crown:building', {});

      // Run build
      const builder = new Builder(config);
      const result = await builder.buildSafe();

      if (result.success) {
        // Notify clients of success
        server.ws.send('crown:success', {
          duration: result.duration,
        });
      } else {
        // Notify clients of error
        server.ws.send('crown:error', {
          message: result.errors.join('\n'),
        });
      }
    } finally {
      isBuilding = false;
    }
  }
}
