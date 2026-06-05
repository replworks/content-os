/* eslint-disable preserve-caught-error */
export function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    console.error('❌ Parsing failed original body:\n', text);
    console.error('❌ Real JSON.parse error:', e);

    throw new Error('JSON_PARSE_ERROR');
  }
}
