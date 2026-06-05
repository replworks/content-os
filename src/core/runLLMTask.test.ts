import { describe, it, expect, vi } from 'vitest';
import { runLLMTask } from './runLLMTask';

describe('runLLMTask', () => {
  const mockSchema = { type: 'object' };
  const mockTemplate = { style: 'test' };
  const mockContext = { topic: '강아지' };
  const mockInput = { title: '기존 콘텐츠' };

  it('should generate data using promptBuilder and generator', async () => {
    const mockPrompt = 'TEST PROMPT';

    const mockPromptBuilder = vi.fn().mockReturnValue(mockPrompt);

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
    });

    expect(mockPromptBuilder).toHaveBeenCalledWith({
      schema: mockSchema,
      template: mockTemplate,
      context: mockContext,
      input: mockInput,
    });

    expect(mockGenerator.generate).toHaveBeenCalledWith(mockPrompt);

    expect(result).toEqual({ result: 'ok' });
  });

  it('should work without input (generate case)', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');

    const mockGenerator = {
      generate: vi
        .fn()
        .mockResolvedValue(JSON.stringify({ title: '블로그 글' })),
    };

    const result = await runLLMTask({
      schema: mockSchema,
      template: mockTemplate,
      context: mockContext,
      generator: mockGenerator,
      promptBuilder: mockPromptBuilder,
    });

    expect(result).toEqual({ title: '블로그 글' });
  });

  it('should throw when generator returns invalid JSON', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');

    const mockGenerator = {
      generate: vi.fn().mockResolvedValue('INVALID_JSON'),
    };

    await expect(
      runLLMTask({
        schema: mockSchema,
        template: mockTemplate,
        context: mockContext,
        generator: mockGenerator,
        promptBuilder: mockPromptBuilder,
      })
    ).rejects.toThrow();
  });

  it('should propagate generator errors (LLM failure)', async () => {
    const mockPromptBuilder = vi.fn().mockReturnValue('PROMPT');

    const mockGenerator = {
      generate: vi.fn().mockRejectedValue(new Error('LLM_ERROR')),
    };

    await expect(
      runLLMTask({
        schema: mockSchema,
        template: mockTemplate,
        context: mockContext,
        generator: mockGenerator,
        promptBuilder: mockPromptBuilder,
      })
    ).rejects.toThrow('LLM_ERROR');
  });

  it('should pass correct prompt structure (integration sanity check)', async () => {
    const mockPromptBuilder = vi
      .fn()
      .mockImplementation(
        ({ schema, template, context, input }) =>
          `SCHEMA:${JSON.stringify(schema)}\nTEMPLATE:${JSON.stringify(
            template
          )}\nCONTEXT:${JSON.stringify(context)}\nINPUT:${JSON.stringify(input)}`
      );

    const mockGenerator = {
      generate: vi.fn().mockResolvedValue(JSON.stringify({ ok: true })),
    };

    await runLLMTask({
      schema: mockSchema,
      template: mockTemplate,
      context: mockContext,
      input: mockInput,
      generator: mockGenerator,
      promptBuilder: mockPromptBuilder,
    });

    const prompt = mockGenerator.generate.mock.calls[0][0];

    expect(prompt).toContain('SCHEMA');
    expect(prompt).toContain('TEMPLATE');
    expect(prompt).toContain('CONTEXT');
    expect(prompt).toContain('INPUT');
  });
});
