/**
 * Development server
 */

import { createServer, type ViteDevServer } from 'vite';
import type { ResolvedCrownConfig } from '../types/config.js';
import { crownPlugin } from './plugin.js';

export interface DevServerOptions {
  /** Open browser automatically */
  open?: boolean;
}

/**
 * Start development server
 */
export async function startDevServer(
  config: ResolvedCrownConfig,
  options: DevServerOptions = {}
): Promise<ViteDevServer> {
  const server = await createServer({
    root: config.root,
    server: {
      port: config.devServer.port,
      host: config.devServer.host,
      open: options.open ?? config.devServer.open,
    },
    plugins: [crownPlugin(config)],
    logLevel: 'info',
    clearScreen: false,
  });

  await server.listen();

  const { port, host } = config.devServer;
  const protocol = 'http';
  const url = `${protocol}://${host}:${port}`;

  console.log('');
  console.log(`👑 Crown dev server running at: ${url}`);
  console.log('');

  return server;
}
