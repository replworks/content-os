import { generate } from "../generator/generate";
import { validate } from "../validators/validate";

export async function runGenerate({
  type,
  templateId,
  context,
}: {
  type: string;
  templateId: string;
  context: any;
}) {
  // 1. generate
  const data = await generate({
    type,
    templateId,
    context,
  });

  // 2. validate
  const result = await validate({
    type,
    data,
  });

  if (!result.valid) {
    throw new Error("VALIDATION_ERROR");
  }

  // 3. envelope
  return {
    type,
    data,
    meta: result.meta,
  };
}
