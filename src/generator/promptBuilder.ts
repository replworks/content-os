export function buildPrompt({
  schema,
  template,
  context,
}: {
  schema: any;
  template: any;
  context: any;
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

CONTEXT:
${JSON.stringify(context, null, 2)}

Generate content now.
`;
}
