# Content OS — Architecture

---

## 0. System Boundary (중요)

Content OS는 하나의 시스템이 아니라
두 개의 역할로 분리된 구조를 가진다.

---

### 1. TS Engine (현재 문서 범위)

이 문서에서 정의하는 시스템은 다음 역할만 담당한다:

* 콘텐츠 생성 (Generator)
* 콘텐츠 변환 (Transformer)
* 콘텐츠 검증 (Validator)
* JSON 기반 처리

즉, **순수 콘텐츠 처리 엔진**이다.

---

### 2. Orchestration Layer (Laravel)

다음 역할은 외부 시스템(Laravel)에서 담당한다:

* 스케줄링 (cron)
* 큐 처리 (queue / batch)
* 다량 생성 (batch execution)
* 후보 선택 (selection)
* 발행 (publish)
* 성과 추적 (analytics)

---

### 3. Design Philosophy

이 분리는 의도적인 것이다.

* TS: **Pure Function Layer (결정적, 테스트 가능)**
* Laravel: **Stateful Orchestration Layer (운영, 흐름, 상태)**

---

### 4. Communication

두 시스템은 API 또는 CLI를 통해 통신한다.

예:

* HTTP API (`/generate`, `/transform`)
* 또는 CLI 실행

---

> Content OS의 핵심은
> “엔진과 운영을 분리하는 것”이다.

---

## 1. System Overview

Content OS (TS Engine)는
**Schema-driven, JSON-first Content Processing Engine**이다.

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
  context,
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

### 7.1 Prompt Composition (핵심)

모든 콘텐츠 생성은 다음 요소로 구성된다:

* Schema (구조 강제)
* Template (형식 정의)
* Context (입력 데이터)
* Prompt Builder (전략)

이 4요소의 조합이 결과 품질을 결정한다.

---

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

→ 즉시 실패

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
    "quality_score": 85,
    "dimensions": {
      "readability": 90,
      "relevance": 80,
      "tone_match": 85,
      "originality": 75
    },
    "warnings": []
  }
}
```

---

## 11. Non Responsibilities

다음은 TS Engine의 책임이 아니다:

* 스케줄링 (Laravel에서 처리)
* 배치 실행 (batch)
* 후보 선택 (selection)
* 배포 (publish)
* 저장 (DB)
* 사용자 관리

---

## 12. Final Statement

이 시스템의 핵심은 단 하나다:

> **LLM을 직접 호출하지 않는다
> → 인터페이스를 통해 “JSON 생성 함수”로 사용한다**

그리고 더 중요한 원칙:

> **이 시스템은 콘텐츠를 “생성”하는 것이 아니라
> 콘텐츠 운영 시스템의 “엔진” 역할을 한다**
