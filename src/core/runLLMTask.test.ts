import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runLLMTask } from './runLLMTask.ts';

describe('runLLMTask', () => {
  const mockSchema = { type: 'object' };
  const mockTemplate = { style: 'test' };
  const mockContext = { topic: '강아지' };
  const mockInput = { title: '기존 콘텐츠' };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return data immediately when the first response is valid JSON', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');
    const mockGenerator = {
      generate: vi.fn().mockResolvedValue(JSON.stringify({ result: 'ok' })),
    };

    const result = await runLLMTask({
      schema: mockSchema,
      template: mockTemplate,
      context: mockContext,
      input: mockInput,
      generator: mockGenerator,
      promptBuilder: mockPromptBuilder,
      traceId: 'trace-123',
    });

    expect(result).toEqual({ result: 'ok' });
    expect(mockGenerator.generate).toHaveBeenCalledTimes(1);
    expect(mockPromptBuilder).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on the third attempt', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockGenerator = {
      generate: vi
        .fn()
        .mockResolvedValueOnce('INVALID_JSON')
        .mockResolvedValueOnce('INVALID_JSON')
        .mockResolvedValueOnce('{"title":"ok"}'),
    };

    const result = await runLLMTask({
      schema: mockSchema,
      template: mockTemplate,
      context: mockContext,
      input: mockInput,
      generator: mockGenerator,
      promptBuilder: mockPromptBuilder,
      traceId: 'trace-123',
    });

    expect(result).toEqual({ title: 'ok' });
    expect(mockGenerator.generate).toHaveBeenCalledTimes(3);
    expect(mockGenerator.generate).toHaveBeenNthCalledWith(1, 'PROMPT');
    expect(mockGenerator.generate).toHaveBeenNthCalledWith(2, 'PROMPT');
    expect(mockGenerator.generate).toHaveBeenNthCalledWith(3, 'PROMPT');
    expect(JSON.parse(warnSpy.mock.calls[0][0])).toMatchObject({
      level: 'warn',
      message: 'runLLMTask:retry',
      traceId: 'trace-123',
      attempt: 1,
    });
    expect(JSON.parse(warnSpy.mock.calls[1][0])).toMatchObject({
      level: 'warn',
      message: 'runLLMTask:retry',
      traceId: 'trace-123',
      attempt: 2,
    });
  });

  it('should throw JSON_PARSE_ERROR after three invalid JSON responses', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockGenerator = {
      generate: vi.fn().mockResolvedValue('INVALID_JSON'),
    };

    await expect(
      runLLMTask({
        schema: mockSchema,
        template: mockTemplate,
        context: mockContext,
        input: mockInput,
        generator: mockGenerator,
        promptBuilder: mockPromptBuilder,
        traceId: 'trace-456',
      })
    ).rejects.toThrow('JSON_PARSE_ERROR');

    expect(mockGenerator.generate).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
