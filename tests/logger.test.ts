import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../src/cli/logger.js';

describe('logger', () => {
  beforeEach(() => {
    logger.setLevel('info');
  });

  it('logs info messages to stdout', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('test message');
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'test message');
    spy.mockRestore();
  });

  it('logs errors to stderr', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('error message');
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'error message');
    spy.mockRestore();
  });

  it('logs warnings to stderr', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.warn('warning message');
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'warning message');
    spy.mockRestore();
  });

  it('respects log level - silent suppresses all', () => {
    logger.setLevel('silent');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('should not appear');
    logger.error('should not appear');
    logger.warn('should not appear');

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('respects log level - error only shows errors', () => {
    logger.setLevel('error');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('info');
    logger.warn('warn');
    logger.error('error');

    expect(logSpy).not.toHaveBeenCalled();
    // warn goes to stderr too, but only error level should show
    expect(errorSpy).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('returns current log level', () => {
    logger.setLevel('debug');
    expect(logger.getLevel()).toBe('debug');
  });
});
