import { describe, it, expect, vi } from 'vitest';
import { validate } from './validate.ts';
import * as loadSchemaModule from '../core/loadSchema.ts';
import * as schemaValidatorModule from './schemaValidator';
import * as qualityEvaluatorModule from './qualityEvaluator';

describe('validate', () => {
  const mockEvaluator = {
    evaluate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return invalid when schema validation fails', async () => {
    // 🔥 mock schema
    vi.spyOn(loadSchemaModule, 'loadSchema').mockReturnValue({});

    // 🔥 schema fail
    vi.spyOn(schemaValidatorModule, 'validateSchema').mockReturnValue({
      valid: false,
      errors: ['title is required'],
    });

    const result = await validate({
      type: 'blog',
      data: {},
      evaluator: mockEvaluator as any,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);

    // ❗ quality는 호출되면 안됨
    expect(qualityEvaluatorModule.evaluateQuality).not.toHaveBeenCalled();
  });

  it('should return valid with meta when schema passes', async () => {
    vi.spyOn(loadSchemaModule, 'loadSchema').mockReturnValue({});

    vi.spyOn(schemaValidatorModule, 'validateSchema').mockReturnValue({
      valid: true,
    });

    const mockMeta = {
      quality_score: 0.8,
      dimensions: {
        readability: 0.8,
        relevance: 0.9,
        tone_match: 0.7,
        originality: 0.8,
      },
      warnings: [],
    };

    vi.spyOn(qualityEvaluatorModule, 'evaluateQuality').mockResolvedValue(
      mockMeta
    );

    const result = await validate({
      type: 'blog',
      data: { title: 'test', body_markdown: 'content' },
      evaluator: mockEvaluator as any,
    });

    expect(result.valid).toBe(true);
    expect(result.meta).toBeDefined();
    expect(result.meta?.quality_score).toBe(0.8);
  });

  it('should call evaluateQuality with correct arguments', async () => {
    vi.spyOn(loadSchemaModule, 'loadSchema').mockReturnValue({});

    vi.spyOn(schemaValidatorModule, 'validateSchema').mockReturnValue({
      valid: true,
    });

    const spy = vi
      .spyOn(qualityEvaluatorModule, 'evaluateQuality')
      .mockResolvedValue({
        quality_score: 0.5,
        dimensions: {
          readability: 0.5,
          relevance: 0.5,
          tone_match: 0.5,
          originality: 0.5,
        },
        warnings: [],
      });

    const data = { title: 'hello', body_markdown: 'world' };

    await validate({
      type: 'blog',
      data,
      evaluator: mockEvaluator as any,
    });

    expect(spy).toHaveBeenCalledWith({
      data,
      evaluator: mockEvaluator,
    });
  });

  it('should propagate evaluator failure (recoverable error)', async () => {
    vi.spyOn(loadSchemaModule, 'loadSchema').mockReturnValue({});

    vi.spyOn(schemaValidatorModule, 'validateSchema').mockReturnValue({
      valid: true,
    });

    vi.spyOn(qualityEvaluatorModule, 'evaluateQuality').mockRejectedValue(
      new Error('LLM_ERROR')
    );

    await expect(
      validate({
        type: 'blog',
        data: { title: 'test' },
        evaluator: mockEvaluator as any,
      })
    ).rejects.toThrow('LLM_ERROR');
  });
});
