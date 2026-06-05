# Content OS - Architecture

## 1. Scope

Content OS is a JSON-first content engine. The code in this repository handles:

* generation
* transformation
* schema validation
* quality evaluation
* hard filtering
* structured logging

External orchestration such as scheduling, queueing, persistence, and publishing is out of scope.

## 2. Core Flow

The runtime flow is:

```text
runGenerate -> generate -> runLLMTask -> hardFilter -> validate -> envelope
runTransform -> transform -> runLLMTask -> hardFilter -> validate -> envelope
```

### Generate flow

`runGenerate({ type, templateId, context, generator, evaluator })`

* creates a `traceId`
* logs `runGenerate:start`
* loads schema and template inside `generate()`
* builds a prompt and calls `generator.generate(prompt)`
* retries JSON parsing up to 3 total attempts
* applies `hardFilter(data)`
* validates data against `schemas/<type>.schema.json`
* evaluates quality with `evaluator.evaluate(prompt)`
* returns `{ type, data, meta }`

### Transform flow

`runTransform({ from, to, templateId, input, context, generator, evaluator })`

* creates a `traceId`
* logs `runTransform:start`
* loads schema and template for `to`
* passes `{ source: input, ...context }` to the transform prompt
* retries JSON parsing up to 3 total attempts
* applies `hardFilter(data)`
* validates data against `schemas/<to>.schema.json`
* evaluates quality with `evaluator.evaluate(prompt)`
* returns `{ type: to, data, meta }`

## 3. Retry Logic

Retry exists only in `runLLMTask()`.

* maximum attempts: 3
* retry condition: JSON parse failure only
* on each failed parse before the final attempt, `runLLMTask:retry` is logged with `attempt`
* on final failure, `JSON_PARSE_ERROR` is thrown
* generator errors are not retried and throw `LLM_ERROR`

## 4. Hard Filter

`hardFilter(data)` runs after LLM output is parsed and before schema validation.

It rejects:

* non-object values
* objects missing all of `title`, `content`, and `body_markdown`
* strings shorter than 5 characters
* strings longer than 10000 characters
* values containing `undefined`
* suspicious brace-heavy text that looks like broken JSON
* forbidden patterns: `lorem ipsum`, `test test`, `dummy`, `asdf`, `1234`

Failure returns `{ valid: false, reason }` and the core flow throws `HARD_FILTER_FAILED` with that reason as the message.

## 5. Error Model

`AppError` is the standard runtime error type.

Supported error codes:

* `JSON_PARSE_ERROR`
* `VALIDATION_ERROR`
* `LLM_ERROR`
* `SCHEMA_NOT_FOUND`
* `TEMPLATE_NOT_FOUND`
* `HARD_FILTER_FAILED`

Behavior:

* missing schema -> `SCHEMA_NOT_FOUND`
* missing template -> `TEMPLATE_NOT_FOUND`
* generator call failure -> `LLM_ERROR`
* invalid JSON after retries -> `JSON_PARSE_ERROR`
* hard filter rejection -> `HARD_FILTER_FAILED`
* schema validation failure inside `runGenerate` / `runTransform` -> `VALIDATION_ERROR`

## 6. Logging

Logging is structured JSON written to stdout/stderr.

Common fields:

* `level`
* `message`
* `traceId`

Observed messages:

* `runGenerate:start`
* `runTransform:start`
* `runLLMTask:request`
* `runLLMTask:retry`
* `runLLMTask:failed`
* `validate:done`

`traceId` is generated per `runGenerate()` / `runTransform()` call and passed through downstream steps.

## 7. Data Model

Final runtime envelope:

```json
{
  "type": "blog",
  "data": {},
  "meta": {}
}
```

`meta` is produced from quality evaluation and contains:

* `quality_score`
* `dimensions`
* `warnings`

## 8. Interfaces

```ts
export interface ContentGenerator {
  generate(prompt: string): Promise<string>;
}

export interface ContentEvaluator {
  evaluate(prompt: string): Promise<string>;
}

export interface TopicGenerator {
  generate(prompt: string): Promise<string>;
}
```
