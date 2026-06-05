export function buildTransformPrompt({
  schema,
  template,
  input,
  context,
}: {
  schema: unknown;
  template: unknown;
  input?: unknown;
  context: Record<string, unknown> | unknown;
}) {
  return `
You are a content transformer.

STRICT RULES:
- Output ONLY valid JSON
- No explanation
- Follow schema

SCHEMA:
${JSON.stringify(schema, null, 2)}

INPUT CONTENT:
${JSON.stringify(input, null, 2)}

CONTEXT:
${JSON.stringify(context, null, 2)}

TEMPLATE:
${JSON.stringify(template, null, 2)}

Convert the content.
`;
}
