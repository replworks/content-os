# Content OS — Implementation Tasks (TS Core Final)

---

## 0. Goal

> **TS Core를 “완전한 실행 엔진”으로 마무리한다**

---

## Scope (TS Only)

TS는 다음만 책임진다:

* generation
* transformation
* validation
* filtering
* selection
* logging
* CLI / API 실행

❌ 제외:

* Feedback Loop
* Performance 분석
* DB / Scheduler
* 외부 orchestration

---

## Current Status

현재 상태:

> **Production-ready 수준 (거의 완료)**

완료:

* Generator / Transformer / Validator
* runGenerate / runTransform
* runGenerateMany (multi-generation)
* JSON parse retry
* AppError 시스템
* Hard Filter
* Schema validation
* Quality evaluation
* threshold filtering
* structured logging + traceId
* CLI
* API (DI 기반)
* 테스트 (LLM 없이)

---

# Phase 1 — Core Runtime (완료)

* [x] generate()
* [x] transform()
* [x] runGenerate()
* [x] runTransform()
* [x] runGenerateMany()

---

# Phase 2 — Reliability (완료)

* [x] JSON retry
* [x] AppError
* [x] error codes
* [x] structured logging

---

# Phase 3 — Validation & Filtering (완료)

* [x] AJV validation
* [x] Hard Filter
* [x] VALIDATION_ERROR
* [x] HARD_FILTER_FAILED

---

# Phase 4 — Multi-generation (완료)

* [x] candidate generation
* [x] topK selection
* [x] evaluator 최소 호출
* [x] final selection

---

# Phase 5 — Quality Control (완료)

* [x] quality_score
* [x] threshold filtering
* [x] LOW_QUALITY 에러

---

# Phase 6 — API Layer (완료)

* [x] Fastify server
* [x] /generate
* [x] /transform
* [x] traceId 포함
* [x] AppError → HTTP mapping
* [x] mock 테스트

---

# Phase 7 — CLI (완료)

* [x] generate CLI
* [x] transform CLI
* [x] JSON output 저장
* [x] exit code 처리

---

# Phase 8 — Testing (완료)

* [x] mock generator
* [x] mock evaluator
* [x] pipeline 테스트
* [x] API 테스트
* [x] retry 테스트
* [x] error 테스트

---

# Phase 9 — Final Polish (🔥 남은 것)

## 9.1 Config System (추천)

* [ ] threshold / count / topK config 분리
* [ ] 환경별 설정 (dev / prod)

---

## 9.2 Context Hook (🔥 중요)

* [ ] 외부 feedback context 주입 가능하도록 구조 정리
* [ ] context merge 유틸

```ts
context = mergeContext(base, external)
```

---

## 9.3 Selection 전략 확장 (선택)

* [ ] custom scoring hook
* [ ] quality 외 추가 점수 반영 가능 구조

---

## 9.4 Logging 개선 (선택)

* [ ] log level 분리 (info / warn / error)
* [ ] production-friendly format 옵션

---

## 9.5 DX 개선 (선택)

* [ ] CLI help 메시지 개선
* [ ] 에러 메시지 더 명확하게

---

# Definition of Done

다음이 모두 만족되면 TS는 끝이다:

* [x] 콘텐츠 생성
* [x] 변환 가능
* [x] schema 통과
* [x] quality filtering
* [x] multi-generation 동작
* [x] 테스트 통과
* [x] traceId 기반 디버깅
* [ ] context injection hook 존재

---

# Final Statement

> TS Core는 “생성 엔진”이다

> **상태를 가지지 않고, 입력을 받아 결과를 반환하는 시스템으로 유지한다**
