# VALIDATORS.md

# Content OS — Validators

---

## 1. Overview

Validator는 Content OS의 핵심이다.

역할:

* 구조 검증 (Schema)
* 품질 평가 (Quality)
* 중복 제거 (Deduplication)
* 메타 생성 (Meta)

> Generator는 “만들고”, Validator는 “판단한다”

---

## 2. Validation Pipeline

```text
Input (data)
↓
Schema Validation
↓
Quality Evaluation
↓
Deduplication
↓
Meta 생성
↓
Output (envelope)
```

---

## 3. Validator Interface

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
```

---

## 4. Schema Validation

## 4.1 목적

* JSON 구조 보장
* 필수 필드 확인
* 타입 검증

---

## 4.2 구현

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

## 5.1 개념

Quality는 단일 값이 아니라
여러 요소의 조합이다.

---

## 5.2 Meta 구조

```json id="fz4z1s"
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

## 5.3 평가 방식

LLM을 사용하여 평가한다.

```ts
async function evaluateQuality(data, context): Promise<Meta> {
  const prompt = `
Evaluate the quality of this content.

Content:
${JSON.stringify(data)}

Criteria:
- readability (clarity, sentence structure)
- relevance (matches topic)
- tone_match (brand alignment)
- originality (not generic or repetitive)

Return JSON only:

{
  "readability": number (0~1),
  "relevance": number (0~1),
  "tone_match": number (0~1),
  "originality": number (0~1),
  "warnings": []
}
`

  const result = await callLLM(prompt)

  const parsed = parseJSON(result)

  const score =
    (parsed.readability +
      parsed.relevance +
      parsed.tone_match +
      parsed.originality) / 4

  return {
    quality_score: score,
    dimensions: parsed,
    warnings: parsed.warnings || []
  }
}
```

---

## 5.4 Threshold (외부 판단)

Validator는 “판단 기준”을 강제하지 않는다.

예:

```ts
if (meta.quality_score < 0.7) {
  discard()
}
```

---

## 6. Deduplication

## 6.1 목적

* 동일 주제 반복 방지
* SEO 품질 유지

---

## 6.2 방식

### Option A — Embedding 기반 (추천)

```ts
function isDuplicate(newContent, existingContents) {
  const newVec = embed(newContent)

  for (const old of existingContents) {
    const sim = cosineSimilarity(newVec, old.vec)

    if (sim > 0.9) return true
  }

  return false
}
```

---

### Option B — LLM 비교

```ts
Compare similarity between two contents (0~1)
```

---

## 6.3 결과 반영

```json id="td3x9u"
{
  "warnings": ["DUPLICATE_CONTENT"]
}
```

---

## 7. Meta Generation

Validator는 최종 meta를 생성한다.

```ts
function buildMeta(quality, duplicate) {
  return {
    quality_score: quality.quality_score,
    dimensions: quality.dimensions,
    warnings: [
      ...quality.warnings,
      ...(duplicate ? ["DUPLICATE"] : [])
    ]
  }
}
```

---

## 8. Error Model

## 8.1 Hard Error

* schema 불일치
* 필수 필드 누락

→ 즉시 실패

---

## 8.2 Recoverable Error

* JSON 파싱 실패
* LLM 평가 실패

→ 호출자가 재시도

---

## 8.3 Soft Fail

* 낮은 품질
* 중복 콘텐츠

→ meta로 전달

---

## 9. Validator Composition

```ts
async function validate(input: ValidateInput): Promise<ValidateResult> {
  // 1. schema
  const schemaResult = validateSchema(loadSchema(input.type), input.data)
  if (!schemaResult.valid) return schemaResult

  // 2. quality
  const quality = await evaluateQuality(input.data)

  // 3. dedupe
  const duplicate = await checkDuplicate(input.data)

  // 4. meta 생성
  const meta = buildMeta(quality, duplicate)

  return {
    valid: true,
    meta
  }
}
```

---

## 10. Performance Considerations

* Quality evaluation은 비용이 높음
* 필요 시 샘플링 가능
* 캐싱 전략 고려

---

## 11. Anti-Patterns

금지:

* validator 없이 publish
* quality_score 없는 콘텐츠
* schema validation 생략
* dedupe 생략

---

## 12. Final Statement

Validator는 보조 시스템이 아니다.

> **Content OS에서 가장 중요한 컴포넌트는
> Generator가 아니라 Validator다**
