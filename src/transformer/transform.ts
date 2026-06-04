import { model } from "../core/gemini";
import { loadTemplate } from "../core/loadTemplate";
import { loadSchema } from "../core/loadSchema";
import { buildTransformPrompt } from "./promptBuilder";
import { parseJSON } from "../utils/parseJSON";

export async function transform({
  from,
  to,
  templateId,
  input,
}: {
  from: string;
  to: string;
  templateId: string;
  input: any;
}) {
  const template = loadTemplate(to, templateId);
  const schema = loadSchema(to);

  const prompt = buildTransformPrompt({
    template,
    input,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = parseJSON(text);

  return parsed;
}
