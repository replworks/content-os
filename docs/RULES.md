# Content OS — Rules

---

## 1. Purpose

This document describes the runtime rules enforced by code.

---

## 2. Generator contracts

* `ContentGenerator.generate(prompt)` must return valid JSON text.
* Prompt output must contain JSON only.
* No additional explanation or text outside the JSON payload.

---

## 3. Schema and template loading

* `loadSchema(type)` reads `schemas/<type>.schema.json`.
* `loadTemplate(type, templateId)` reads `templates/<type>/<templateId>.json`.
* Missing files throw an error.

---

## 4. Validation rules

* `validate({type,data,evaluator})` validates output against schema.
* Schema validation uses AJV strict mode with `allErrors: true`.
* If schema validation fails, `validate()` returns `{ valid: false, errors }`.
* If schema validation passes, quality evaluation is performed.

---

## 5. Quality evaluator rules

* `evaluateQuality({data,evaluator})` requires an evaluator instance.
* It sends a prompt containing the generated content.
* Expected evaluator JSON keys:
  * `quality_score` (number, 0-100)
  * `dimensions` with `readability`, `relevance`, `tone_match`, `originality`
  * `warnings` array
* The parsed evaluator JSON is returned as meta.

---

## 6. Error handling

* Invalid JSON from the LLM causes `JSON_PARSE_ERROR`.
* Missing or invalid `generator`/`evaluator` functions throw errors.
* `runTransform()` throws `VALIDATION_ERROR` when validation fails.

---

## 7. Implementation scope

* `runGenerate()` outputs `{ type, data, meta }`.
* `runTransform()` outputs `{ type, data, meta }`.
* No score threshold or discard logic is enforced in current code.
* Retry behavior is not implemented inside the core functions.
