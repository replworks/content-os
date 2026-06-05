import { model } from '../core/gemini.ts';
import { loadTemplate } from '../core/loadTemplate.ts';
import { buildTransformPrompt } from './promptBuilder.ts';
import { parseJSON } from '../utils/parseJSON.ts';

/* eslint-disable @typescript-eslint/no-unused-vars */
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

  const prompt = buildTransformPrompt({
    template,
    input,
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = parseJSON(text);

  return parsed;
}
