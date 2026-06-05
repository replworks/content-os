import { generate } from '../generator/generate.ts';
import { validate } from '../validators/validate.ts';
import {
  ContentGenerator,
  ContentEvaluator,
} from '../interfaces/llm.interface.ts';

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function runTransform({
  from,
  to,
  templateId,
  input,
  generator,
  evaluator,
}: {
  from: string;
  to: string;
  templateId: string;
  input: any;
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
}) {
  const data = await generate({
    type: to,
    templateId,
    context: input,
    generator: generator,
  });

  const result = await validate({ type: to, data, evaluator });

  return {
    type: to,
    data,
    meta: result.meta,
  };
}
