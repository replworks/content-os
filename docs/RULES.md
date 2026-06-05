# RULES.md

# Content OS — Rules

---

## 1. Overview

RULES.md는 Content OS의 **운영 기준**을 정의한다.

이 문서는 다음을 결정한다:

* 무엇을 실패로 볼 것인가
* 무엇을 통과시킬 것인가
* 언제 재시도할 것인가
* 어떤 콘텐츠를 버릴 것인가

> Architecture가 “구조”라면
> RULES는 “판단 기준”이다

---

## 2. Core Philosophy

### 2.1 Generator는 단순해야 한다

* 생성만 한다
* 판단하지 않는다

---

### 2.2 Validator는 판단한다

* 구조
* 품질

---

### 2.3 최종 결정은 Pipeline이 한다

* 재시도 여부
* 폐기 여부
* 저장 여부

---

## 3. Error Model

Content OS는 3가지 에러를 가진다.

---

### 3.1 Hard Error (즉시 실패)

정의:

* 시스템적으로 잘못된 상태

예:

* schema 없음
* template 없음
* schema validation 실패

---

### 처리

```ts
throw new Error("VALIDATION_ERROR")
```

---

### 특징

* 재시도 의미 없음
* 즉시 중단

---

## 3.2 Recoverable Error (재시도 가능)

정의:

* LLM 또는 파싱 문제

예:

* JSON 파싱 실패
* LLM이 JSON 외 출력
* evaluator 실패

---

### 처리

```ts
retry(max=2~3)
```

---

### 규칙

* 동일 입력으로 재시도
* prompt 수정 금지 (MVP 기준)

---

## 3.3 Soft Fail (성공이지만 폐기 가능)

정의:

* 구조는 정상
* 품질 문제

---

### 예

* quality_score 낮음
* warnings 존재

---

### 처리

```ts
if (meta.quality_score < threshold) {
  discard()
}
```

---

## 4. Retry Policy

### 4.1 대상

* JSON_PARSE_ERROR
* LLM_ERROR

---

### 4.2 정책

```ts
maxRetry = 3
```

---

### 4.3 Backoff (선택)

```ts
delay = 500ms → 1000ms → 2000ms
```

---

### 4.4 금지

* 무한 retry 금지
* prompt 수정 금지 (MVP)

---

## 5. Quality Rules

### 5.1 Threshold

기본 기준:

```ts
quality_score >= 0.7
```

---

### 5.2 Dimension 최소 기준 (선택)

```ts
readability >= 0.6
relevance >= 0.6
```

---

### 5.3 폐기 기준

```ts
if (quality_score < 0.7) discard
if (warnings.includes("SPAM")) discard
```

---

## 6. Warning Rules

warnings는 “에러가 아니다”

---

### 예

```json
[
  "TOO_GENERIC",
  "LOW_ORIGINALITY",
  "WEAK_HOOK"
]
```

---

### 규칙

* warnings는 meta에 포함
* pipeline이 해석

---

## 7. JSON Rules (중요)

### 7.1 절대 규칙

* JSON 외 출력 금지
* trailing text 금지
* 설명 금지

---

### 7.2 파싱 실패 시

```ts
throw new Error("JSON_PARSE_ERROR")
```

---

## 8. Content Rules

### 8.1 Markdown 강제

* body는 반드시 markdown

---

### 8.2 구조 위반 금지

* schema 외 필드 금지

---

### 8.3 길이 기준

* summary: 30~200
* body: 최소 300자

---

## 9. Transform Rules

### 9.1 동일 구조 유지

* output도 동일 envelope

---

### 9.2 재검증 필수

```ts
transform → validate
```

---

### 9.3 독립성

* transform은 generator와 별개

---

## 10. Pipeline Decision Rules

Pipeline은 다음을 결정한다:

---

### 10.1 저장

```ts
if (valid && quality_score >= threshold)
```

---

### 10.2 재시도

```ts
if (error is recoverable)
```

---

### 10.3 폐기

```ts
if (quality_score < threshold)
```

---

## 11. Logging Rules

모든 단계는 로그를 남긴다:

---

### 필수 로그

```ts
{
  step: "generate | validate | transform",
  status: "success | fail",
  error?: string,
  retryCount?: number
}
```

---

## 12. Anti-Patterns

금지:

* validator 없이 publish
* JSON 파싱 무시
* retry 없이 실패 처리
* quality 기준 없는 저장
* generator에서 판단 로직 추가

---

## 13. MVP Simplification

현재 MVP에서는:

* deduplication 제외
* adaptive learning 없음
* prompt auto-fix 없음

---

## 14. Final Statement

이 시스템은 완벽한 콘텐츠를 만들지 않는다.

> **대신, 잘못된 콘텐츠를 걸러낸다**

그리고 그것이 더 중요하다.
