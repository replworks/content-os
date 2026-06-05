# Content OS — Validators

---

## 1. Purpose

Validation ensures generated or transformed content matches schema and computes quality meta.
It does not validate input context.

---

## 2. `validate()`

Signature:

```ts
async function validate({
  type,
  data,
  evaluator,
}: {
  type: string;
  data: any;
  evaluator: ContentEvaluator;
})
```

Behavior:

* load schema with `loadSchema(type)`
* validate data with `validateSchema(schema, data)`
* if invalid, return `{ valid: false, errors }`
* if valid, call `evaluateQuality({ data, evaluator })`
* return `{ valid: true, meta }`

---

## 3. Schema validation

`validateSchema(schema, data)`:

* uses AJV strict mode
* compiles and validates the schema
* returns `{ valid: true }` or `{ valid: false, errors }`

---

## 4. Quality evaluation

Signature:

```ts
async function evaluateQuality({
  data,
  evaluator,
}: {
  data: any;
  evaluator: ContentEvaluator;
})
```

Behavior:

* throws `QUALITY_LLM_REQUIRED` if evaluator is missing
* sends a prompt containing the generated content
* parses the evaluator JSON output
* returns parsed object as meta

Expected evaluator JSON:

```json
{
  "quality_score": 0,
  "dimensions": {
    "readability": 0,
    "relevance": 0,
    "tone_match": 0,
    "originality": 0
  },
  "warnings": []
}
```

---

## 5. Execution

* `runGenerate()` validates generated content and returns `{ type, data, meta }`.
* `runTransform()` validates transformed content and throws `VALIDATION_ERROR` when invalid.

---

## 6. Errors

* invalid schema validation returns errors in `validate()` result
* invalid JSON from evaluator or generator throws `JSON_PARSE_ERROR`
* evaluator errors propagate from `evaluate()`
