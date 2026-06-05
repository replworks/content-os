import { describe, it, expect, vi } from 'vitest';
import { evaluateQuality } from './qualityEvaluator';

describe('evaluateQuality', () => {
  const validResponse = JSON.stringify({
    quality_score: 85,
    dimensions: {
      readability: 80,
      relevance: 90,
      tone_match: 85,
      originality: 75,
    },
    warnings: [],
  });

  it('should return parsed quality result when evaluator succeeds', async () => {
    const mockEvaluator = {
      evaluate: vi.fn().mockResolvedValue(validResponse),
    };

    const data = {
      title: '테스트',
      body_markdown: '내용입니다.',
    };

    const result = await evaluateQuality({
      data,
      evaluator: mockEvaluator,
    });

    expect(result).toBeDefined();
    expect(result.quality_score).toBe(85);
    expect(result.dimensions.readability).toBe(80);

    expect(mockEvaluator.evaluate).toHaveBeenCalled();
  });

  it('should include content JSON in prompt', async () => {
    const mockEvaluator = {
      evaluate: vi.fn().mockResolvedValue(validResponse),
    };

    const data = {
      title: '강아지',
    };

    await evaluateQuality({
      data,
      evaluator: mockEvaluator,
    });

    const prompt = mockEvaluator.evaluate.mock.calls[0][0];

    expect(prompt).toContain('Evaluate the quality of this content');
    expect(prompt).toContain('"title":"강아지"');
  });

  it('should throw error when evaluator is missing', async () => {
    await expect(
      evaluateQuality({
        data: {},
        evaluator: undefined as any,
      })
    ).rejects.toThrow('QUALITY_LLM_REQUIRED');
  });

  it('should throw when evaluator returns invalid JSON', async () => {
    const mockEvaluator = {
      evaluate: vi.fn().mockResolvedValue('INVALID_JSON'),
    };

    await expect(
      evaluateQuality({
        data: {},
        evaluator: mockEvaluator,
      })
    ).rejects.toThrow();
  });

  it('should propagate evaluator errors (LLM failure)', async () => {
    const mockEvaluator = {
      evaluate: vi.fn().mockRejectedValue(new Error('LLM_ERROR')),
    };

    await expect(
      evaluateQuality({
        data: {},
        evaluator: mockEvaluator,
      })
    ).rejects.toThrow('LLM_ERROR');
  });
});
