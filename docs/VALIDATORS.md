# VALIDATORS.md

# Content OS — Validators

---

## 1. Overview

Validator는 Content OS의 핵심이다.

역할:

* 구조 검증 (Schema)
* 품질 평가 (Quality)
* 메타 생성 (Meta)

> Generator는 “생성”, Validator는 “판단”

---

## 2. Validation Pipeline

```text
Input (data)
↓
Schema Validation
↓
Quality Evaluation (LLM)
↓
Meta 생성
↓
Output (envelope)
```

※ Deduplication은 MVP에서 제외

---

## 3. Validator Interface (중요)

```ts
type ValidateInput = {
  type: string
  data: any
  evaluator: ContentEvaluator
}

type ValidateResult = {
  valid: boolean
  errors?: string[]
  meta?: Meta
}

async function validate(input: ValidateInput): Promise<ValidateResult>
```

---

## 4. Schema Validation

### 목적

* JSON 구조 보장
* 필수 필드 검증
* 타입 검증

---

### 구현

```ts
function validateSchema(schema, data) {
  const valid = ajv.validate(schema, data)

  if (!valid) {
    return {
      valid: false,
      errors: ajv.errors
    }
  }

  return { valid: true }
}
```

---

## 5. Quality Evaluation

### 5.1 핵심

* LLM을 통해 평가
* Validator 내부에서 직접 호출하지 않음
* **ContentEvaluator 주입 사용**

---

### 5.2 Meta 구조

```json
{
  "quality_score": 85,
  "dimensions": {
    "readability": 90,
    "relevance": 80,
    "tone_match": 85,
    "originality": 75
  },
  "warnings": ["Some minor grammar issues."]
}
```

---

### 5.3 구현 (DI 기반)

```ts
async function evaluateQuality(data, evaluator) {
  const prompt = `
Evaluate the quality of this content.

Return ONLY JSON:
{
  "quality_score": number (0-100),
  "dimensions": {
    "readability": number,
    "relevance": number,
    "tone_match": number,
    "originality": number
  },
  "warnings": string[]
}

CONTENT:
${JSON.stringify(data)}
`

  const result = await evaluator.evaluate(prompt)
  const parsed = parseJSON(result)

  return {
    quality_score: parsed.quality_score,
    dimensions: parsed.dimensions,
    warnings: parsed.warnings || []
  }
}
```

---

## 6. Meta Generation

```ts
function buildMeta(quality) {
  return {
    quality_score: quality.quality_score,
    dimensions: quality.dimensions,
    warnings: quality.warnings
  }
}
```

---

## 7. Error Model

### Hard Error

* schema 불일치
* 필수 필드 누락

→ 즉시 실패

---

### Recoverable Error

* JSON 파싱 실패
* LLM 평가 실패

→ 호출자가 재시도

---

### Soft Fail

* 품질 낮음
* 경고 발생

→ meta로 전달

---

## 8. Validator Composition

```ts
async function validate(input: ValidateInput) {
  // 1. schema
  const schemaResult = validateSchema(
    loadSchema(input.type),
    input.data
  )

  if (!schemaResult.valid) return schemaResult

  // 2. quality
  const quality = await evaluateQuality(
    input.data,
    input.evaluator
  )

  // 3. meta
  const meta = buildMeta(quality)

  return {
    valid: true,
    meta
  }
}
```

---

## 9. Anti-Patterns

금지:

* validator 없이 publish
* LLM 직접 호출
* meta 없는 콘텐츠
* schema validation 생략

---

## 10. Final Statement

Validator는 보조 시스템이 아니다.

> **Content OS에서 가장 중요한 것은
> “무엇을 생성하느냐”가 아니라
> “무엇을 통과시키느냐”다**
