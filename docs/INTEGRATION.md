# Content OS — Integration Spec (Laravel)

---

## 0. Purpose

이 문서는 **Content OS (TS)** 와 **Laravel 시스템** 간의
명확한 역할 분리와 연동 규격을 정의한다.

> ❗ 이 문서는 “참고 문서”가 아니라
> **반드시 지켜야 하는 계약(Contract)** 이다.

---

## 1. System Boundary

### Content OS (TS Core)

역할:

* 콘텐츠 생성 (LLM)
* schema validation
* hard filtering
* quality evaluation
* candidate selection (default)

---

### Laravel (External System)

역할:

* 콘텐츠 저장 (DB)
* 발행 (publish)
* 성과 수집 (views, CTR, engagement 등)
* scoring 계산
* selection 전략 정의 (override 가능)

---

## 2. High-level Flow

```text
[TS]
generateMany → candidates 반환
        ↓
[Laravel]
저장 → publish → 성과 수집
        ↓
scoring 계산
        ↓
[선택 전략]
        ↓
[TS 재호출 or Laravel 선택]
```

---

## 3. Data Contract

## 3.1 TS → Laravel (Generation Output)

### 기본 응답 구조

```json
{
  "type": "blog",
  "traceId": "uuid",
  "candidates": [
    {
      "data": {},
      "meta": {
        "quality_score": 82,
        "dimensions": {},
        "warnings": []
      }
    }
  ],
  "winnerIndex": 0
}
```

---

### 필드 설명

| 필드                 | 설명           |
| ------------------ | ------------ |
| type               | 콘텐츠 타입       |
| traceId            | 요청 단위 추적 ID  |
| candidates         | 생성된 후보 리스트   |
| meta.quality_score | LLM 기반 품질 점수 |
| winnerIndex        | TS 기본 선택 결과  |

---

## 3.2 Laravel → TS (Optional Re-selection)

Laravel은 선택 전략을 override 할 수 있다.

### 입력

```json
{
  "candidates": [
    {
      "data": {},
      "meta": { "quality_score": 82 },
      "scores": {
        "custom": 91,
        "ctr_weighted": 88
      }
    }
  ]
}
```

---

### 요구 사항

* `scores`는 Laravel이 계산한다
* TS는 `scores`를 해석하지 않는다
* selectionFn에서만 사용한다

---

## 4. Selection Strategy

## 4.1 Default (TS)

```text
quality_score 기준 최고값 선택
```

---

## 4.2 Laravel Override

Laravel은 다음 방식 중 하나를 선택한다:

### 방식 A — Laravel에서 직접 선택

```php
$winner = collect($candidates)
  ->sortByDesc(fn($c) => $c['scores']['custom'])
  ->first();
```

👉 TS 재호출 없음

---

### 방식 B — TS selectionFn override

```ts
const selectionFn = (candidates) => {
  return candidates.reduce((bestIdx, c, i, arr) => {
    const score = c.scores?.custom ?? c.meta.quality_score
    const best = arr[bestIdx].scores?.custom ?? arr[bestIdx].meta.quality_score
    return score > best ? i : bestIdx
  }, 0)
}
```

👉 TS 재사용 가능

---

## 5. Scoring Rules (Laravel 책임)

Laravel은 반드시 다음을 수행해야 한다:

### 5.1 성과 데이터 수집

예:

```json
{
  "views": 1200,
  "clicks": 80,
  "ctr": 0.067,
  "engagement": 0.45
}
```

---

### 5.2 scoring 계산

```php
$score = (
  $quality_score * 0.4 +
  $ctr * 0.3 +
  $engagement * 0.3
);
```

---

### 5.3 후보에 점수 주입

```json
{
  "scores": {
    "custom": 91
  }
}
```

---

## 6. Persistence Model (Laravel)

권장 DB 구조:

### contents

| 필드            | 설명        |
| ------------- | --------- |
| id            | uuid      |
| type          | blog      |
| data          | JSON      |
| quality_score | number    |
| created_at    | timestamp |

---

### performance

| 필드         | 설명        |
| ---------- | --------- |
| content_id | FK        |
| views      | int       |
| clicks     | int       |
| ctr        | float     |
| engagement | float     |
| updated_at | timestamp |

---

## 7. Responsibilities (Strict)

## TS MUST NOT

* DB 접근
* 성과 데이터 사용
* CTR 계산
* scoring 로직 포함
* business KPI 판단

---

## Laravel MUST

* 성과 데이터 관리
* scoring 계산
* selection 전략 정의
* 콘텐츠 lifecycle 관리

---

## 8. Error Handling

### TS → Laravel

| 코드                 | 설명           |
| ------------------ | ------------ |
| LOW_QUALITY        | threshold 미달 |
| VALIDATION_ERROR   | schema 실패    |
| HARD_FILTER_FAILED | 안전 필터 실패     |
| JSON_PARSE_ERROR   | LLM 응답 파싱 실패 |

---

### Laravel 대응

* 실패 콘텐츠 저장 금지
* retry 정책은 Laravel에서 결정

---

## 9. Design Principles

### 1. Stateless TS

> TS는 상태를 가지지 않는다

---

### 2. Decision outside

> 판단은 항상 Laravel에서 한다

---

### 3. Config over Code

> 전략은 코드가 아니라 외부에서 변경 가능해야 한다

---

### 4. Batch over Real-time

> Feedback은 실시간이 아니라 batch 처리

---

## 10. Minimal Integration Checklist

Laravel 구현 시 반드시 체크:

* [ ] candidates 저장
* [ ] performance 데이터 수집
* [ ] scoring 계산
* [ ] selection 전략 정의
* [ ] winner 결정 방식 선택 (TS vs Laravel)

---

## 11. Final Principle

> TS는 “생성 엔진”이다
> Laravel은 “판단 시스템”이다

둘을 섞으면 시스템이 무너진다.
