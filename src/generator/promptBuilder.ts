export function buildPrompt({
  schema,
  template,
  context,
}: {
  schema: unknown;
  template: unknown;
  context: Record<string, unknown> | unknown;
}) {
  return `
You are a content generator.

STRICT RULES:
- Output ONLY valid JSON
- No explanation
- No markdown outside JSON
- Follow schema exactly

SCHEMA:
${JSON.stringify(schema, null, 2)}

TEMPLATE:
${JSON.stringify(template, null, 2)}

LEARNED RULES:
${JSON.stringify((context as Record<string, unknown>)?.learned_rules || [], null, 2)}

CONTEXT:
${JSON.stringify(context, null, 2)}

Generate content now.
`;
}
