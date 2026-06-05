import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logInfo } from './logger.ts';

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should output JSON string when logInfo is called', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logInfo('runGenerate:start', {
      traceId: 'trace-123',
      type: 'blog',
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should include message in the serialized output', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logInfo('validate:done', {
      traceId: 'trace-123',
      quality_score: 88,
    });

    const payload = JSON.parse(spy.mock.calls[0][0]);

    expect(payload.message).toBe('validate:done');
  });

  it('should include meta fields in the serialized output', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logInfo('runLLMTask:request', {
      traceId: 'trace-123',
      type: 'blog',
    });

    const payload = JSON.parse(spy.mock.calls[0][0]);

    expect(payload.traceId).toBe('trace-123');
    expect(payload.type).toBe('blog');
    expect(payload.level).toBe('info');
  });
});
