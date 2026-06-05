# Content OS - Rules

## 1. Output Rule

LLM output must be JSON only.

* no prose before or after the JSON payload
* parsing failures trigger `JSON_PARSE_ERROR` after retry exhaustion

## 2. Retry Rule

Retry is handled only by `runLLMTask()`.

* maximum attempts: 3
* retry happens only when JSON parsing fails
* generator execution errors are not retried

## 3. Hard Filter Rule

`hardFilter(data)` runs after JSON parsing and before schema validation.

It rejects:

* non-object values
* objects missing all of `title`, `content`, and `body_markdown`
* strings shorter than 5 characters
* strings longer than 10000 characters
* content containing `undefined`
* suspicious brace-heavy content
* forbidden patterns: `lorem ipsum`, `test test`, `dummy`, `asdf`, `1234`

Rejected output becomes `HARD_FILTER_FAILED`.

## 4. Validation Rule

Validation happens in two stages:

1. AJV schema validation against `schemas/<type>.schema.json`
2. quality evaluation through `ContentEvaluator`

Behavior:

* schema failure returns `{ valid: false, errors }`
* `runGenerate()` / `runTransform()` turn invalid results into `VALIDATION_ERROR`
* successful validation returns `{ valid: true, meta }`

## 5. Quality Meta

`evaluateQuality({ data, evaluator })` expects the evaluator to return JSON with:

* `quality_score`
* `dimensions`
* `warnings`

This payload is returned as `meta`.

## 6. Loading Rules

* `loadSchema(type)` reads `schemas/<type>.schema.json`
* `loadTemplate(type, templateId)` reads `templates/<type>/<templateId>.json`
* missing schema files throw `SCHEMA_NOT_FOUND`
* missing template files throw `TEMPLATE_NOT_FOUND`

## 7. Logging Rule

Logs are JSON objects written to console.

Common fields:

* `level`
* `message`
* `traceId`

Messages include:

* `runGenerate:start`
* `runTransform:start`
* `runLLMTask:request`
* `runLLMTask:retry`
* `runLLMTask:failed`
* `validate:done`

## 8. Runtime Envelope

Successful operations return:

```json
{
  "type": "blog",
  "data": {},
  "meta": {}
}
```

`runTransform()` uses `to` as the returned type.
