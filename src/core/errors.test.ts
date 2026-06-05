import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, ERROR_CODES } from './errors.ts';
import { runLLMTask } from './runLLMTask.ts';
import { runGenerate } from './runGenerate.ts';
import * as validateModule from '../validators/validate.ts';

describe('AppError', () => {
  it('should set code and message correctly', () => {
    const error = new AppError(ERROR_CODES.LLM_ERROR, 'LLM failed');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ERROR_CODES.LLM_ERROR);
    expect(error.message).toBe('LLM failed');
  });
});

describe('standardized errors', () => {
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

  it('should throw VALIDATION_ERROR when runGenerate validation fails', async () => {
    const mockGenerator = {
      generate: vi.fn().mockResolvedValue(JSON.stringify({ title: 'ok' })),
    };
    vi.spyOn(validateModule, 'validate').mockResolvedValue({
      valid: false,
      errors: [{ message: 'invalid' }] as any,
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
      code: ERROR_CODES.VALIDATION_ERROR,
      message: ERROR_CODES.VALIDATION_ERROR,
    });
  });
});
