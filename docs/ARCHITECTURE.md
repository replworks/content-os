# Content OS - Architecture (Strict Separation Version)

---

## 1. Scope (CRITICAL)

Content OS는 두 개의 완전히 분리된 시스템으로 구성된다:

### 1️⃣ TS Core (이 레포지토리)

> **Stateless Content Execution Engine**

책임:

* generation
* transformation
* schema validation
* quality evaluation
* hard filtering
* selection (multi-generation)
* structured logging

---

### 2️⃣ External System (Laravel / Scheduler / Worker)

> **Stateful Orchestration & Learning System**

책임:

* scheduling
* queueing
* persistence (DB)
* publishing
* performance tracking
* feedback loop
* context optimization

---

## ❗ Hard Rule (절대 규칙)

TS Core는 다음을 절대 하지 않는다:

* DB 접근 ❌
* 파일 기반 상태 관리 ❌
* performance 저장 ❌
* feedback 분석 ❌
* 학습 로직 ❌
* 자동 전략 변경 ❌

> TS는 “입력 → 출력”만 수행하는 **순수 실행 엔진**이다

---

## 2. Core Flow (TS Only)

```text
runGenerate -> generate -> runLLMTask -> hardFilter -> validate -> envelope
runGenerateMany -> generateMany -> hardFilter -> topK -> validate -> envelope
runTransform -> transform -> runLLMTask -> hardFilter -> validate -> envelope
```

---

## 3. Generate Flow

`runGenerate({ type, templateId, context, generator, evaluator })`

* traceId 생성
* `runGenerate:start` 로그
* schema / template 로딩
* prompt 생성 후 LLM 호출
* JSON parse retry (최대 3회)
* hardFilter 적용
* schema validation
* quality evaluation
* `{ type, data, meta }` 반환

---

## 4. Transform Flow

`runTransform({ from, to, templateId, input, context, generator, evaluator })`

* traceId 생성
* transform prompt 실행
* JSON retry
* hardFilter
* schema validation
* quality evaluation
* 결과 반환

---

## 5. Multi-generation Flow

`runGenerateMany({ type, templateId, context, generator, evaluator, count, topK })`

* count 만큼 후보 생성
* 각 후보에 hardFilter 적용
* cheap scoring으로 정렬
* topK 선택
* topK에만 validate 수행
* 최종 quality_score 기반 선택

기본값:

* count = 5
* topK = 2

---

## 6. Retry Logic

위치: `runLLMTask()`

* 최대 3회 시도
* JSON parse 실패 시만 retry
* 최종 실패 → `JSON_PARSE_ERROR`
* LLM 호출 실패 → `LLM_ERROR`

---

## 7. Hard Filter

위치: LLM output 직후

차단 조건:

* non-object
* 핵심 필드 없음
* 너무 짧거나 긴 문자열
* undefined 포함
* 깨진 JSON 패턴
* 금지 문자열 (lorem ipsum 등)

실패 시:

```
HARD_FILTER_FAILED
```

---

## 8. Error Model

`AppError`

코드:

* JSON_PARSE_ERROR
* VALIDATION_ERROR
* LLM_ERROR
* SCHEMA_NOT_FOUND
* TEMPLATE_NOT_FOUND
* HARD_FILTER_FAILED
* LOW_QUALITY

---

## 9. Logging

구조:

```json
{
  "level": "info",
  "message": "...",
  "traceId": "..."
}
```

---

## 10. Data Model

```json
{
  "type": "blog",
  "data": {},
  "meta": {
    "quality_score": 85,
    "dimensions": {},
    "warnings": []
  }
}
```

---

## 11. Interfaces

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

# 12. Context Injection (ONLY Allowed Extension)

TS Core가 허용하는 유일한 확장 지점:

```ts
runGenerate({
  context
})
```

---

### 규칙

* context는 외부에서 전달된다
* TS는 context를 **읽기만 한다**
* TS는 context를 **생성하지 않는다**

---

### 예시

```ts
context = {
  topic: "강아지 행동",
  preferred_patterns: ["리스트형"],
  avoid_patterns: ["긴 문단"]
}
```

---

# 13. Feedback Loop (EXTERNAL ONLY)

## ❗ 절대 TS에서 구현 금지

---

## 위치

Laravel / Worker / Scheduler

---

## Flow

```text
TS Generate → Output JSON
            ↓
      Publish (External)
            ↓
   Performance Data 수집
            ↓
      DB 저장
            ↓
   Batch Analyzer 실행
            ↓
   Pattern 추출
            ↓
   Context 생성
            ↓
   다음 요청에 주입
```

---

## TS와의 연결

TS는 단순히 다음을 받는다:

```ts
context = externalContext
```

끝.

---

## TS가 하지 않는 것 (강조)

* 성과 분석 ❌
* CTR 계산 ❌
* pattern 추출 ❌
* 자동 최적화 ❌
* topic 학습 ❌

---

# 14. System Philosophy

> LLM은 학습하지 않는다
> → 우리는 입력(context)을 개선한다

---

# Final Statement

> TS Core는 “생각하는 시스템”이 아니다

> **외부 시스템이 생각하고, TS는 실행한다**
