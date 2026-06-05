import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../core/runGenerate.ts', () => ({
  runGenerate: vi.fn(),
}));

vi.mock('../core/runTransform.ts', () => ({
  runTransform: vi.fn(),
}));

import { runGenerate } from '../core/runGenerate.ts';
import { runTransform } from '../core/runTransform.ts';
import { fastify } from './server.ts';
import { AppError, ERROR_CODES } from '../core/errors.ts';

describe('API server', () => {
  beforeEach(() => {
    vi.mocked(runGenerate).mockReset();
    vi.mocked(runTransform).mockReset();
  });

  it('returns traceId and envelope from /generate', async () => {
    vi.mocked(runGenerate).mockResolvedValue({
      type: 'blog',
      data: {
        title: 'title',
        summary: 'summary',
        body_markdown: 'body',
      },
      meta: {
        quality_score: 85,
        dimensions: {
          readability: 80,
          relevance: 90,
          tone_match: 85,
          originality: 75,
        },
        warnings: [],
      },
    } as never);

    const response = await fastify.inject({
      method: 'POST',
      url: '/generate',
      payload: {
        type: 'blog',
        templateId: 'seo-v1',
        context: {
          topic: '강아지가 혀를 내미는 이유',
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.traceId).toBeDefined();
    expect(body.type).toBe('blog');
    expect(body.data.title).toBe('title');
    expect(body.meta.quality_score).toBe(85);
  });

  it('returns traceId and envelope from /transform', async () => {
    vi.mocked(runTransform).mockResolvedValue({
      type: 'sns',
      data: {
        platform: 'twitter',
        content: 'hello',
      },
      meta: {
        quality_score: 90,
        dimensions: {
          readability: 80,
          relevance: 90,
          tone_match: 85,
          originality: 75,
        },
        warnings: [],
      },
    } as never);

    const response = await fastify.inject({
      method: 'POST',
      url: '/transform',
      payload: {
        from: 'blog',
        to: 'sns',
        templateId: 'sns-transform',
        input: {
          title: 'title',
        },
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.traceId).toBeDefined();
    expect(body.type).toBe('sns');
    expect(body.data.content).toBe('hello');
    expect(body.meta.quality_score).toBe(90);
  });

  it('returns 400 for invalid /generate payload', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/generate',
      payload: {
        type: 'blog',
        templateId: 'seo-v1',
      },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(body.traceId).toBeDefined();
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it('maps AppError to HTTP status and standard error response', async () => {
    vi.mocked(runGenerate).mockRejectedValue(
      new AppError(ERROR_CODES.LLM_ERROR, 'LLM failed')
    );

    const response = await fastify.inject({
      method: 'POST',
      url: '/generate',
      payload: {
        type: 'blog',
        templateId: 'seo-v1',
        context: {
          topic: '강아지가 혀를 내미는 이유',
        },
      },
    });

    expect(response.statusCode).toBe(502);

    const body = response.json();
    expect(body.traceId).toBeDefined();
    expect(body.error.code).toBe(ERROR_CODES.LLM_ERROR);
  });
});
