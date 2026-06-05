import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError, ERROR_CODES } from '../core/errors.ts';
import { buildServer } from './server.ts';

describe('API server', () => {
  const mockGenerator = {
    generate: vi.fn(),
  };

  const mockEvaluator = {
    evaluate: vi.fn(),
  };

  const fastify = buildServer({
    generator: mockGenerator,
    evaluator: mockEvaluator,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns traceId and envelope from /generate', async () => {
    mockGenerator.generate.mockResolvedValueOnce(
      JSON.stringify({
        title: 'A valid blog title',
        summary: 'This is a valid summary for the blog content.',
        body_markdown:
          'This is a sufficiently long body markdown content that passes the hard filter and schema validation. '.repeat(
            4
          ),
      })
    );

    mockEvaluator.evaluate.mockResolvedValueOnce(
      JSON.stringify({
        quality_score: 85,
        dimensions: {
          readability: 80,
          relevance: 90,
          tone_match: 85,
          originality: 75,
        },
        warnings: [],
      })
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

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.traceId).toBeDefined();
    expect(body.type).toBe('blog');
    expect(body.data.title).toBe('A valid blog title');
    expect(body.meta.quality_score).toBe(85);
    expect(mockGenerator.generate).toHaveBeenCalledTimes(1);
    expect(mockEvaluator.evaluate).toHaveBeenCalledTimes(1);
  });

  it('returns traceId and envelope from /transform', async () => {
    mockGenerator.generate.mockResolvedValueOnce(
      JSON.stringify({
        platform: 'twitter',
        content: 'This is a valid SNS content payload.',
      })
    );

    mockEvaluator.evaluate.mockResolvedValueOnce(
      JSON.stringify({
        quality_score: 90,
        dimensions: {
          readability: 80,
          relevance: 90,
          tone_match: 85,
          originality: 75,
        },
        warnings: [],
      })
    );

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
    expect(body.data.content).toBe('This is a valid SNS content payload.');
    expect(body.meta.quality_score).toBe(90);
    expect(mockGenerator.generate).toHaveBeenCalledTimes(1);
    expect(mockEvaluator.evaluate).toHaveBeenCalledTimes(1);
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
    mockGenerator.generate.mockRejectedValueOnce(
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
