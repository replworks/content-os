export function parseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ Parsing failed original body:\n", text);
    console.error("❌ Real JSON.parse error:", e);

    throw new Error("JSON_PARSE_ERROR");
  }
}
