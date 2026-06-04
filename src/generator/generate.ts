import { model } from "../core/gemini";
import { loadSchema } from "../core/loadSchema";
import { loadTemplate } from "../core/loadTemplate";
import { buildPrompt } from "./promptBuilder";
import { parseJSON } from "../utils/parseJSON";

export async function generate({
  type,
  templateId,
  context,
}: {
  type: string;
  templateId: string;
  context: any;
}) {
  const schema = loadSchema(type);
  const template = loadTemplate(type, templateId);

  const prompt = buildPrompt({
    schema,
    template,
    context,
  });

  const result = await model.generateContent(prompt);

  const text = result.response.text();

  return parseJSON(text);
}
