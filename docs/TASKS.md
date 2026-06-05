# Content OS — Implementation Tasks

---

## 0. Goal

목표:

> **안정적인 Content Engine을 완성하고, 이후 Content OS(Runtime)로 확장한다**

---

## Scope (확정)

* CLI 기반 실행
* Blog 콘텐츠 생성
* Blog → SNS 변환
* Validator (schema + quality)
* TopicGenerator 인터페이스
* JSON 파일 출력
* 테스트 포함
* **LLM 인터페이스 기반 (DI 구조)**

---

## Current Status

현재 Core Engine은 완성 상태:

* Schema / template 로딩
* Generator / Transformer / Validator
* runGenerate / runTransform
* TopicGenerator 인터페이스 정의
* CLI 실행 + outputs 저장
* Mock 기반 테스트

### Reliability & Safety (완료)

* JSON parse retry
* AppError 기반 에러 표준화
* Structured logging + traceId
* Hard Filter (TS 기반 1차 필터)
* 테스트 커버리지 확보

---

# Phase 1 — Content Engine (완료 단계)

## Day 1 ~ Day 8

모든 핵심 기능 완료됨.

---

## Day 9 — Stabilization (마무리 단계)

### 목표

운영 가능한 안정성 확보

---

### 작업

* [ ] CLI UX 개선 (에러 출력 / 결과 포맷 정리)
* [ ] 로그 포맷 정리 (불필요 로그 제거)
* [ ] traceId propagation 점검
* [ ] 문서 정합성 체크 (ARCHITECTURE / CONTEXT / RULES)
* [ ] 에러 메시지 통일성 점검

---

### 완료 조건

* CLI 실행 시 디버깅 가능
* 로그만으로 문제 추적 가능
* 문서 ↔ 코드 불일치 없음

---

# 🚀 Phase 2 — Content OS Core (다음 단계)

> 이제부터가 IDEAS.md 구현 영역

---

## Day 10 — Topic Generation

### 목표

콘텐츠 “주제 생성 시스템” 구축

---

### 작업

* [ ] TopicGenerator 구현체 (Gemini 기반)
* [ ] topic schema 정의
* [ ] generateTopic() 함수 구현
* [ ] topic 테스트 작성

---

### 결과

```ts
topics = await generateTopics({ context })
```

---

## Day 11 — Multi Generation

### 목표

한 번에 여러 콘텐츠 생성

---

### 작업

* [ ] generateMany() 구현
* [ ] 병렬 실행 처리
* [ ] traceId 그룹 관리
* [ ] 실패 개별 처리

---

### 결과

```ts
candidates = await generateMany({ topic, count: 5 })
```

---

## Day 12 — Candidate Selection

### 목표

여러 결과 중 선택

---

### 작업

* [ ] selection 전략 구현

  * 최고 점수 선택
  * threshold 필터
* [ ] reject 처리
* [ ] selection 테스트

---

### 결과

```ts
best = selectBest(candidates)
```

---

## Day 13 — Content Pipeline

### 목표

전체 흐름 연결

---

### 작업

* [ ] pipeline 함수 구현

```ts
topic → generateMany → filter → validate → select
```

---

### 완료 조건

* 한 번의 실행으로 최종 콘텐츠 생성

---

## Day 14 — Output Strategy

### 목표

운영 가능한 출력 구조

---

### 작업

* [ ] outputs 구조 개선
* [ ] topic / candidates / final 분리 저장
* [ ] traceId 기반 파일 관리

---

---

# Phase 3 — Runtime (Laravel 영역)

> TS 영역 아님 (설계만)

---

## 목표

지속적인 콘텐츠 운영

---

### 구성

* Queue
* Batch
* Scheduler (cron)
* API 호출 (TS)

---

### 역할 분리

| 역할             | 담당      |
| -------------- | ------- |
| Content Engine | TS      |
| Orchestration  | Laravel |

---

---

## Definition of Done (Phase 1)

* CLI 실행 가능
* JSON schema 통과
* meta 포함
* SNS 변환 가능
* 테스트 통과
* 에러/로그/필터 안정화 완료

---

## Definition of Done (Phase 2)

* topic 생성 가능
* multi generation 가능
* 자동 선택 가능
* pipeline 완성

---

## Final Statement

이 시스템은 두 단계로 완성된다:

> 1. **절대 깨지지 않는 Content Engine (TS)**
> 2. **멈추지 않는 Content OS (Laravel Runtime)**

현재 상태:

> ✅ Engine 완성 직전
> 🔜 OS 구축 단계 진입
