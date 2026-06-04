export function buildTransformPrompt({
  template,
  input,
}: {
  template: any;
  input: any;
}) {
  return `
You are a content transformer.

STRICT RULES:
- Output ONLY valid JSON
- No explanation
- Follow schema

INPUT CONTENT:
${JSON.stringify(input, null, 2)}

TEMPLATE:
${JSON.stringify(template, null, 2)}

Transform the content.
`;
}
