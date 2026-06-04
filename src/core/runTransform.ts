import { generate } from "../generator/generate";
import { validate } from "../validators/validate";
import {
  ContentGenerator,
  ContentEvaluator,
} from "../interfaces/llm.interface";

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
