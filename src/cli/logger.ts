/**
 * Pretty console logging utilities
 */

import pc from 'picocolors';

export const logger = {
  info(message: string): void {
    console.log(pc.blue('ℹ'), message);
  },

  success(message: string): void {
    console.log(pc.green('✔'), message);
  },

  warn(message: string): void {
    console.log(pc.yellow('⚠'), message);
  },

  error(message: string): void {
    console.log(pc.red('✖'), message);
  },

  crown(message: string): void {
    console.log(pc.magenta('👑'), message);
  },

  dim(message: string): void {
    console.log(pc.dim(message));
  },
};
