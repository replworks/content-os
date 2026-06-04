# ARCHITECTURE.md

# Content OS — Architecture

---

## 1. System Overview

Content OS는 **Schema-driven, JSON-first Content Generation System**이다.

모든 콘텐츠는 다음 흐름을 따른다:

```text
Generator → Validator → Output
                 ↓
           Transformer
                 ↓
             Validator → Output
```

---

## 2. Core Design Principles

### 2.1 JSON First

* 모든 입출력은 JSON
* 모든 콘텐츠는 동일한 envelope 구조 사용

---

### 2.2 Schema Driven

* Content Type별 schema 존재
* Generator는 schema를 기반으로 JSON 생성

---

### 2.3 Stateless Generator

* Generator는 상태를 가지지 않는다
* 입력 → 출력 (순수 함수)

---

### 2.4 Separation of Concerns

* Generator: 콘텐츠 생성
* Validator: 검증 + 메타 생성
* Transformer: 콘텐츠 변환
* Publisher: 외부 배포 (현재 제외)

---

## 3. Directory Structure

```bash
content-os/
├── core/
│   ├── types.ts
│   ├── errors.ts
│   └── config.ts
│
├── generator/
│   ├── index.ts
│   ├── generate.ts
│   ├── prompt-builder.ts
│   └── llm-client.ts
│
├── transformer/
│   ├── index.ts
│   └── transform.ts
│
├── validators/
│   ├── index.ts
│   ├── schema-validator.ts
│   ├── quality-validator.ts
│   └── dedupe-validator.ts
│
├── schemas/
│   ├── blog.schema.json
│   ├── faq.schema.json
│   ├── docs.schema.json
│   └── sns.schema.json
│
├── templates/
│   ├── blog/
│   │   ├── seo-v1.json
│   │   ├── list-v1.json
│   │   └── story-v1.json
│   │
│   ├── docs/
│   └── sns/
│
├── outputs/
│   └── *.json
│
└── publishers/   (MVP 제외)
```

---

## 4. Data Model

## 4.1 Envelope (공통 구조)

모든 콘텐츠는 동일한 구조를 가진다.

```json
{
  "type": "blog",
  "data": { ... },
  "meta": { ... }
}
```

---

## 4.2 Data (Schema 기반)

각 Content Type은 별도의 schema를 가진다.

예: blog.schema.json

```json
{
  "type": "object",
  "required": ["title", "body_markdown"],
  "properties": {
    "title": { "type": "string" },
    "body_markdown": { "type": "string" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

## 4.3 Meta (Validator 생성)

```json
{
  "quality_score": 0.0,
  "dimensions": {
    "readability": 0.0,
    "relevance": 0.0,
    "tone_match": 0.0,
    "originality": 0.0
  },
  "warnings": []
}
```

---

## 5. Core Interfaces

## 5.1 Generate

```ts
type GenerateInput = {
  type: string
  templateId: string
  context: Context
  constraints?: Constraints
}

type GenerateResult = {
  type: string
  data: any
}

async function generate(input: GenerateInput): Promise<GenerateResult>
```

---

## 5.2 Transform

```ts
type TransformInput = {
  from: string
  to: string
  input: Envelope
  templateId?: string
}

type TransformResult = {
  type: string
  data: any
}

async function transform(input: TransformInput): Promise<TransformResult>
```

---

## 5.3 Validate

```ts
type ValidateInput = {
  type: string
  data: any
}

type ValidateResult = {
  valid: boolean
  errors?: string[]
  meta?: Meta
}

function validate(input: ValidateInput): ValidateResult
```

---

## 6. Execution Flow

## 6.1 Generation Flow

```ts
async function runGenerate(input: GenerateInput) {
  // 1. schema load
  const schema = loadSchema(input.type)

  // 2. template load
  const template = loadTemplate(input.type, input.templateId)

  // 3. prompt 생성
  const prompt = buildPrompt(input, schema, template)

  // 4. LLM 호출
  const raw = await callLLM(prompt)

  // 5. JSON 파싱
  const parsed = parseJSON(raw)

  // 6. validation
  const result = validate({
    type: input.type,
    data: parsed
  })

  if (!result.valid) throw new Error("VALIDATION_FAILED")

  // 7. envelope 생성
  return {
    type: input.type,
    data: parsed,
    meta: result.meta
  }
}
```

---

## 6.2 Transform Flow

```ts
async function runTransform(input: TransformInput) {
  const schema = loadSchema(input.to)

  const prompt = buildTransformPrompt(input, schema)

  const raw = await callLLM(prompt)

  const parsed = parseJSON(raw)

  const result = validate({
    type: input.to,
    data: parsed
  })

  if (!result.valid) throw new Error("VALIDATION_FAILED")

  return {
    type: input.to,
    data: parsed,
    meta: result.meta
  }
}
```

---

## 7. Prompt Strategy

## 7.1 Generator Prompt

```ts
function buildPrompt(input, schema, template) {
  return `
You must generate JSON only.

Schema:
${JSON.stringify(schema)}

Template:
${JSON.stringify(template)}

Context:
${JSON.stringify(input.context)}

Rules:
- Output valid JSON only
- Follow schema strictly
- Do not add extra fields
- body must be markdown

Generate now.
`
}
```

---

## 7.2 Transform Prompt

```ts
function buildTransformPrompt(input, schema) {
  return `
Convert the following content into target format.

Source:
${JSON.stringify(input.input.data)}

Target Schema:
${JSON.stringify(schema)}

Rules:
- Output valid JSON only
- Do not include explanation

Generate now.
`
}
```

---

## 8. Validators

## 8.1 Schema Validator

```ts
function validateSchema(schema, data) {
  const valid = ajv.validate(schema, data)
  if (!valid) throw Error("SCHEMA_INVALID")
}
```

---

## 8.2 Quality Validator

```ts
function evaluateQuality(data): Meta {
  return {
    quality_score: 0.75,
    dimensions: {
      readability: 0.8,
      relevance: 0.7,
      tone_match: 0.8,
      originality: 0.7
    },
    warnings: []
  }
}
```

---

## 8.3 Deduplication

```ts
function checkDuplicate(data) {
  // 기존 콘텐츠와 비교
}
```

---

## 9. Error Handling

### Hard Error

* schema 없음
* template 없음

→ throw

---

### Recoverable Error

* JSON 파싱 실패
* LLM 출력 이상

→ 호출자 재시도

---

### Soft Fail

* 품질 낮음
* 중복

→ meta로 전달

---

## 10. Output Example

### Blog

```json
{
  "type": "blog",
  "data": {
    "title": "강아지가 혀를 내미는 이유",
    "body_markdown": "..."
  },
  "meta": {
    "quality_score": 0.82,
    "dimensions": {
      "readability": 0.9,
      "relevance": 0.8,
      "tone_match": 0.85,
      "originality": 0.75
    }
  }
}
```

---

## 11. Non Responsibilities

* 스케줄링
* 배포
* 저장
* 사용자 관리

---

## 12. Next Steps

* SCHEMAS.md 작성
* TEMPLATE 정의
* Validator 고도화
* Batch pipeline 구성

---

## 13. Final Statement

이 시스템의 핵심은 단 하나다:

> **LLM을 “글쓰기 도구”가 아니라
> “JSON 생성 함수”로 사용하는 것**
