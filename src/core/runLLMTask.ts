import { parseJSON } from '../utils/parseJSON.ts';
import type { ContentGenerator } from '../interfaces/llm.interface.ts';
import { AppError, ERROR_CODES } from './errors.ts';
import { logError, logInfo, logWarn } from './logger.ts';

type PromptBuilderArgs<TSchema, TTemplate, TContext, TInput> = {
  schema: TSchema;
  template: TTemplate;
  context: TContext;
  input?: TInput;
};

export async function runLLMTask<
  TOutput = Record<string, unknown>,
  TSchema = unknown,
  TTemplate = unknown,
  TContext extends Record<string, unknown> = Record<string, unknown>,
  TInput = unknown,
>({
  schema,
  template,
  context,
  input,
  generator,
  promptBuilder,
  traceId,
}: {
  schema: TSchema;
  template: TTemplate;
  context: TContext;
  input?: TInput;
  generator: ContentGenerator;
  promptBuilder: (
    args: PromptBuilderArgs<TSchema, TTemplate, TContext, TInput>
  ) => string;
  traceId?: string;
}): Promise<TOutput> {
  logInfo('runLLMTask:request', { traceId });

  const prompt = promptBuilder({
    schema,
    template,
    context,
    input,
  });

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let text: string;

    try {
      text = await generator.generate(prompt);
    } catch {
      logError('runLLMTask:failed', { traceId });
      throw new AppError(ERROR_CODES.LLM_ERROR);
    }

    try {
      return parseJSON<TOutput>(text);
    } catch {
      if (attempt === maxAttempts) {
        logError('runLLMTask:failed', { traceId });
        throw new AppError(ERROR_CODES.JSON_PARSE_ERROR);
      }

      logWarn('runLLMTask:retry', { traceId, attempt });
    }
  }

  logError('runLLMTask:failed', { traceId });
  throw new AppError(ERROR_CODES.JSON_PARSE_ERROR);
}
