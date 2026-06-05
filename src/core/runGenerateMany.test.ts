import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../generator/generateMany.ts', () => ({
  generateMany: vi.fn(),
}));

vi.mock('../validators/validate.ts', () => ({
  validate: vi.fn(),
}));

import { generateMany } from '../generator/generateMany.ts';
import { validate } from '../validators/validate.ts';
import { runGenerateMany } from './runGenerateMany.ts';

describe('runGenerateMany', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate only top K candidates and return the best quality result', async () => {
    vi.mocked(generateMany).mockResolvedValue([
      {
        data: {
          title: 'Candidate A',
          summary: 'Candidate A summary that is definitely long enough.',
          body_markdown: 'A'.repeat(320),
        },
        cheapScore: 10,
        initialScore: 10,
      },
      {
        data: {
          title: 'Candidate B',
          summary: 'Candidate B summary that is definitely long enough.',
          body_markdown: 'B'.repeat(320),
        },
        cheapScore: 50,
        initialScore: 50,
      },
      {
        data: {
          title: 'Candidate C',
          summary: 'Candidate C summary that is definitely long enough.',
          body_markdown: 'C'.repeat(320),
        },
        cheapScore: 40,
        initialScore: 40,
      },
    ] as never);

    vi.mocked(validate)
      .mockResolvedValueOnce({
        valid: true,
        meta: {
          quality_score: 70,
          dimensions: {
            readability: 70,
            relevance: 70,
            tone_match: 70,
            originality: 70,
          },
          warnings: [],
        },
      } as never)
      .mockResolvedValueOnce({
        valid: true,
        meta: {
          quality_score: 85,
          dimensions: {
            readability: 85,
            relevance: 85,
            tone_match: 85,
            originality: 85,
          },
          warnings: [],
        },
      } as never);

    const result = await runGenerateMany({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
      },
      generator: {
        generate: vi.fn(),
      },
      evaluator: {
        evaluate: vi.fn(),
      },
      traceId: 'trace-123',
      count: 5,
      topK: 2,
    });

    expect(generateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'blog',
        templateId: 'seo-v1',
        traceId: 'trace-123',
        count: 5,
      })
    );
    expect(validate).toHaveBeenCalledTimes(2);
    expect(result.type).toBe('blog');
    expect(
      (result as { meta: { quality_score: number } }).meta.quality_score
    ).toBe(85);
    expect((result as { data: { title: string } }).data.title).toBe(
      'Candidate C'
    );
  });

  it('should return all validated candidates with defaultWinnerIndex in candidates mode', async () => {
    vi.mocked(generateMany).mockResolvedValue([
      {
        data: {
          title: 'Candidate A',
          summary: 'Candidate A summary that is definitely long enough.',
          body_markdown: 'A'.repeat(320),
        },
        cheapScore: 10,
        initialScore: 10,
      },
      {
        data: {
          title: 'Candidate B',
          summary: 'Candidate B summary that is definitely long enough.',
          body_markdown: 'B'.repeat(320),
        },
        cheapScore: 20,
        initialScore: 20,
      },
    ] as never);

    vi.mocked(validate)
      .mockResolvedValueOnce({
        valid: true,
        meta: {
          quality_score: 85,
          dimensions: {
            readability: 85,
            relevance: 85,
            tone_match: 85,
            originality: 85,
          },
          warnings: [],
        },
      } as never)
      .mockResolvedValueOnce({
        valid: true,
        meta: {
          quality_score: 75,
          dimensions: {
            readability: 75,
            relevance: 75,
            tone_match: 75,
            originality: 75,
          },
          warnings: [],
        },
      } as never);

    const result = await runGenerateMany({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
      },
      generator: {
        generate: vi.fn(),
      },
      evaluator: {
        evaluate: vi.fn(),
      },
      traceId: 'trace-candidates',
      count: 5,
      topK: 2,
      mode: 'candidates',
    });

    expect((result as any).candidates).toHaveLength(2);
    expect((result as any).defaultWinnerIndex).toBe(0);
    expect((result as any).candidates[0].data.title).toBe('Candidate B');
  });

  it('should preserve external scores on validated candidate objects in candidates mode', async () => {
    vi.mocked(generateMany).mockResolvedValue([
      {
        data: {
          title: 'Candidate A',
          summary: 'Candidate A summary that is definitely long enough.',
          body_markdown: 'A'.repeat(320),
        },
        cheapScore: 10,
        initialScore: 10,
        scores: {
          custom: 92,
          ctr_weighted: 88,
        },
      },
    ] as never);

    vi.mocked(validate).mockResolvedValue({
      valid: true,
      meta: {
        quality_score: 90,
        dimensions: {
          readability: 90,
          relevance: 90,
          tone_match: 90,
          originality: 90,
        },
        warnings: [],
      },
    } as never);

    const result = await runGenerateMany({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
      },
      generator: {
        generate: vi.fn(),
      },
      evaluator: {
        evaluate: vi.fn(),
      },
      traceId: 'trace-scores',
      count: 5,
      topK: 1,
      mode: 'candidates',
    });

    expect((result as any).candidates).toHaveLength(1);
    expect((result as any).candidates[0].scores).toEqual({
      custom: 92,
      ctr_weighted: 88,
    });
    expect((result as any).defaultWinnerIndex).toBe(0);
  });

  it('should allow selectionFn to override the default winner', async () => {
    vi.mocked(generateMany).mockResolvedValue([
      {
        data: {
          title: 'Candidate A',
          summary: 'Candidate A summary with a friendly tone.',
          body_markdown: 'A'.repeat(320),
        },
        cheapScore: 40,
        initialScore: 40,
      },
      {
        data: {
          title: 'Candidate B',
          summary: 'Candidate B summary with a formal tone.',
          body_markdown: 'B'.repeat(320),
        },
        cheapScore: 50,
        initialScore: 50,
      },
    ] as never);

    vi.mocked(validate)
      .mockResolvedValueOnce({
        valid: true,
        meta: {
          quality_score: 90,
          dimensions: {
            readability: 90,
            relevance: 90,
            tone_match: 90,
            originality: 90,
          },
          warnings: [],
        },
      } as never)
      .mockResolvedValueOnce({
        valid: true,
        meta: {
          quality_score: 80,
          dimensions: {
            readability: 80,
            relevance: 80,
            tone_match: 80,
            originality: 80,
          },
          warnings: [],
        },
      } as never);

    const result = await runGenerateMany({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
      },
      generator: {
        generate: vi.fn(),
      },
      evaluator: {
        evaluate: vi.fn(),
      },
      traceId: 'trace-selectfn',
      count: 5,
      topK: 2,
      selectionFn: () => 0,
    });

    expect((result as { data: { title: string } }).data.title).toBe(
      'Candidate B'
    );
  });

  it('should choose the first candidate when quality score ties', async () => {
    vi.mocked(generateMany).mockResolvedValue([
      {
        data: {
          title: 'Candidate A',
          summary: 'Candidate A summary with a friendly tone.',
          body_markdown: 'A'.repeat(320),
        },
        cheapScore: 40,
        initialScore: 40,
      },
      {
        data: {
          title: 'Candidate B',
          summary: 'Candidate B summary with a formal tone.',
          body_markdown: 'B'.repeat(320),
        },
        cheapScore: 50,
        initialScore: 50,
      },
    ] as never);

    vi.mocked(validate).mockResolvedValue({
      valid: true,
      meta: {
        quality_score: 80,
        dimensions: {
          readability: 80,
          relevance: 80,
          tone_match: 80,
          originality: 80,
        },
        warnings: [],
      },
    } as never);

    const result = await runGenerateMany({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
      },
      generator: {
        generate: vi.fn(),
      },
      evaluator: {
        evaluate: vi.fn(),
      },
      traceId: 'trace-score',
      count: 5,
      topK: 2,
    });

    expect((result as { data: { title: string } }).data.title).toBe(
      'Candidate B'
    );
  });

  it('should throw LOW_QUALITY when no top candidate passes threshold', async () => {
    vi.mocked(generateMany).mockResolvedValue([
      {
        data: {
          title: 'Candidate A',
          summary: 'Candidate A summary that is definitely long enough.',
          body_markdown: 'A'.repeat(320),
        },
        cheapScore: 10,
        initialScore: 10,
      },
    ] as never);

    vi.mocked(validate).mockResolvedValue({
      valid: true,
      meta: {
        quality_score: 40,
        dimensions: {
          readability: 40,
          relevance: 40,
          tone_match: 40,
          originality: 40,
        },
        warnings: [],
      },
    } as never);

    await expect(
      runGenerateMany({
        type: 'blog',
        templateId: 'seo-v1',
        context: {
          topic: '강아지가 혀를 내미는 이유',
        },
        generator: {
          generate: vi.fn(),
        },
        evaluator: {
          evaluate: vi.fn(),
        },
        traceId: 'trace-456',
        count: 5,
        topK: 2,
      })
    ).rejects.toMatchObject({
      code: 'LOW_QUALITY',
    });
  });
});
