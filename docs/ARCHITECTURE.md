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

### 2.5 LLM Abstraction (중요)

LLM은 직접 호출되지 않는다.

모든 LLM 호출은 인터페이스를 통해 주입된다.

```ts
ContentGenerator
ContentEvaluator
TopicGenerator
```

→ 시스템은 특정 LLM(Gemini 등)에 의존하지 않는다.

---

## 3. Directory Structure

```bash
content-os/
├── src/
│   ├── core/
│   ├── generator/
│   ├── transformer/
│   ├── validators/
│   ├── interfaces/
│   └── utils/
│
├── schemas/
├── templates/
├── outputs/
├── tests/
```

---

## 4. Data Model

### 4.1 Envelope

```json
{
  "type": "blog",
  "data": {},
  "meta": {}
}
```

---

### 4.2 Data (Schema 기반)

각 콘텐츠는 schema를 따른다.

---

### 4.3 Meta (Validator 생성)

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

### 5.1 LLM Interfaces (핵심)

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

---

### 5.2 Generate

```ts
async function generate({
  type,
  templateId,
  context,
  generator
}): Promise<any>
```

---

### 5.3 Transform

```ts
async function transform({
  from,
  to,
  templateId,
  input,
  generator
}): Promise<any>
```

---

### 5.4 Validate

```ts
async function validate({
  type,
  data,
  evaluator
}): Promise<{
  valid: boolean
  meta?: Meta
}>
```

---

## 6. Execution Flow

### 6.1 Generation Flow

```ts
async function runGenerate(input) {
  const data = await generate(input)

  const result = await validate({
    type: input.type,
    data,
    evaluator: input.evaluator
  })

  if (!result.valid) throw new Error("VALIDATION_ERROR")

  return {
    type: input.type,
    data,
    meta: result.meta
  }
}
```

---

### 6.2 Transform Flow

```ts
async function runTransform(input) {
  const data = await transform(input)

  const result = await validate({
    type: input.to,
    data,
    evaluator: input.evaluator
  })

  if (!result.valid) throw new Error("VALIDATION_ERROR")

  return {
    type: input.to,
    data,
    meta: result.meta
  }
}
```

---

## 7. Prompt Strategy

### Generator

```ts
generator.generate(prompt)
```

---

### Transformer

```ts
generator.generate(prompt)
```

---

### Evaluator

```ts
evaluator.evaluate(prompt)
```

---

## 8. Validators

### 8.1 Schema Validator

AJV 기반 검증

---

### 8.2 Quality Evaluator

LLM 기반 평가 (ContentEvaluator 사용)

---

### 8.3 Deduplication

MVP 제외

---

## 9. Error Handling

### Hard Error

* schema 없음
* template 없음

---

### Recoverable Error

* JSON 파싱 실패
* LLM 출력 이상

→ 호출자가 재시도

---

### Soft Fail

* 품질 낮음
* 경고 발생

→ meta에 포함

---

## 10. Output Example

```json
{
  "type": "blog",
  "data": {},
  "meta": {
    "quality_score": 0.82
  }
}
```

---

## 11. Non Responsibilities

* 스케줄링 (Laravel에서 처리)
* 배포
* 저장
* 사용자 관리

---

## 12. Final Statement

이 시스템의 핵심은 단 하나다:

> **LLM을 직접 호출하지 않는다
> → 인터페이스를 통해 “JSON 생성 함수”로 사용한다**
