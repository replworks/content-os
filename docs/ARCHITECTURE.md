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
runGenerateMany -> generateMany -> hardFilter -> topK -> validate -> envelope
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

### Multi-generation flow

`runGenerateMany({ type, templateId, context, generator, evaluator, count, topK })`

* generates `count` candidates using `generate()`
* applies `hardFilter()` to each candidate
* sorts remaining candidates by a cheap local score
* keeps the top `topK` candidates
* runs `validate()` only for the selected top `topK` candidates
* selects the final winner by highest `quality_score`
* defaults:
  * `count = 5`
  * `topK = 2`

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

## 9. Feedback Loop (Performance-driven Evolution)

Content OS는 단순 생성 시스템이 아니라
성과 기반으로 **스스로 개선되는 시스템**이다.

### 목적

* 어떤 콘텐츠가 잘 되는지 학습
* 다음 generation 품질 개선
* 선택 전략 최적화

---

### 위치 (Out of Core Scope)

Feedback Loop는 core TS runtime이 아닌
**external layer (Laravel / Scheduler / Worker)** 에서 동작한다.

Core는 다음만 담당:

* 콘텐츠 생성
* meta (quality_score 등) 생성

---

### 데이터 흐름

```text
Generate → Output(JSON) → Publish
                        ↓
                 Performance Data 수집
                        ↓
                 Feedback Store (JSON/DB)
                        ↓
                 Context / Template 업데이트
                        ↓
                 다음 generation에 반영
```

---

### 저장 데이터 (예시)

```json
{
  "content_id": "uuid",
  "type": "blog",
  "topic": "강아지가 혀를 내미는 이유",
  "quality_score": 82,
  "performance": {
    "views": 1200,
    "clicks": 80,
    "ctr": 0.067,
    "engagement": 0.45
  },
  "timestamp": 1710000000
}
```

---

### 적용 방식

Feedback은 직접 generator를 바꾸지 않는다.

대신:

* context 강화
* template 수정
* topic selection 개선

---

### 적용 예시

```ts
context = {
  topic: "강아지 행동",
  preferred_patterns: ["리스트형", "짧은 문장"],
  avoid_patterns: ["너무 긴 문단"],
}
```

---

### 설계 원칙

* 실시간 반영 금지 (batch 처리)
* low-cost 분석 우선 (rule 기반)
* LLM 사용 최소화

---

### 핵심 철학

> LLM은 학습하지 않는다  
> → 우리는 입력을 개선한다
