/**
 * Pretty console logging utilities with log levels
 */

import pc from 'picocolors';

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

let currentLevel: LogLevel = 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] <= LOG_LEVEL_ORDER[currentLevel];
}

export const logger = {
  setLevel(level: LogLevel): void {
    currentLevel = level;
  },

  getLevel(): LogLevel {
    return currentLevel;
  },

  info(message: string): void {
    if (shouldLog('info')) {
      console.log(pc.blue('ℹ'), message);
    }
  },

  success(message: string): void {
    if (shouldLog('info')) {
      console.log(pc.green('✔'), message);
    }
  },

  warn(message: string): void {
    if (shouldLog('warn')) {
      console.error(pc.yellow('⚠'), message);
    }
  },

  error(message: string): void {
    if (shouldLog('error')) {
      console.error(pc.red('✖'), message);
    }
  },

  debug(message: string): void {
    if (shouldLog('debug')) {
      console.log(pc.gray('●'), pc.dim(message));
    }
  },

  crown(message: string): void {
    if (shouldLog('info')) {
      console.log(pc.magenta('👑'), message);
    }
  },

  dim(message: string): void {
    if (shouldLog('info')) {
      console.log(pc.dim(message));
    }
  },
};
