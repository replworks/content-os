import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, ERROR_CODES } from './errors.ts';
import { runLLMTask } from './runLLMTask.ts';
import { runGenerate } from './runGenerate.ts';
import { runTransform } from './runTransform.ts';
import * as validateModule from '../validators/validate.ts';
import * as hardFilterModule from '../validators/hardFilter.ts';

describe('AppError', () => {
  it('should set code and message correctly', () => {
    const error = new AppError(ERROR_CODES.LLM_ERROR, 'LLM failed');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ERROR_CODES.LLM_ERROR);
    expect(error.message).toBe('LLM failed');
  });
});

describe('LLM errors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw JSON_PARSE_ERROR when runLLMTask cannot parse JSON', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');
    const mockGenerator = {
      generate: vi.fn().mockResolvedValue('INVALID_JSON'),
    };

    await expect(
      runLLMTask({
        schema: {},
        template: {},
        context: {},
        generator: mockGenerator as any,
        promptBuilder: mockPromptBuilder,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.JSON_PARSE_ERROR,
      message: ERROR_CODES.JSON_PARSE_ERROR,
    });
  });
});

describe('Generate errors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw HARD_FILTER_FAILED when runGenerate hard filter fails', async () => {
    const mockGenerator = {
      generate: vi.fn().mockResolvedValue(JSON.stringify({ title: 'ok' })),
    };
    vi.spyOn(hardFilterModule, 'hardFilter').mockReturnValue({
      valid: false,
      reason: 'TOO_SHORT',
    });
    vi.spyOn(validateModule, 'validate').mockResolvedValue({
      valid: true,
      meta: {},
    } as any);

    await expect(
      runGenerate({
        type: 'blog',
        templateId: 'seo-v1',
        context: {},
        generator: mockGenerator as any,
        evaluator: { evaluate: vi.fn() } as any,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.HARD_FILTER_FAILED,
      message: 'TOO_SHORT',
    });
  });
});

describe('Transform errors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw HARD_FILTER_FAILED when runTransform hard filter fails', async () => {
    const mockGenerator = {
      generate: vi.fn().mockResolvedValue(JSON.stringify({ content: 'ok' })),
    };

    vi.spyOn(hardFilterModule, 'hardFilter').mockReturnValue({
      valid: false,
      reason: 'FORBIDDEN_PATTERN',
    });

    vi.spyOn(validateModule, 'validate').mockResolvedValue({
      valid: true,
      meta: {},
    } as any);

    await expect(
      runTransform({
        from: 'blog',
        to: 'sns',
        templateId: 'sns-transform',
        input: { title: 'source content' },
        context: {},
        generator: mockGenerator as any,
        evaluator: { evaluate: vi.fn() } as any,
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.HARD_FILTER_FAILED,
      message: 'FORBIDDEN_PATTERN',
    });
  });
});
