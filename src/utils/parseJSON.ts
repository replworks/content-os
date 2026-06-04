export function parseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("JSON_PARSE_ERROR");
  }
}
