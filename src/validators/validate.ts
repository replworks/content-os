import { loadSchema } from "../core/loadSchema";
import { validateSchema } from "./schemaValidator";
import { evaluateQuality } from "./qualityEvaluator";
import { buildMeta } from "./metaBuilder";

export async function validate({ type, data }: { type: string; data: any }) {
  const schema = loadSchema(type);

  // 1. schema validation
  const schemaResult = validateSchema(schema, data);

  if (!schemaResult.valid) {
    return {
      valid: false,
      errors: schemaResult.errors,
    };
  }

  // 2. quality evaluation
  const quality = await evaluateQuality(data);

  // 3. meta 생성
  const meta = buildMeta(quality);

  return {
    valid: true,
    meta,
  };
}
