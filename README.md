# Content OS

> **LLM을 “콘텐츠 생성 도구”가 아니라  
> “멈추지 않는 콘텐츠 운영 시스템”으로 만드는 엔진**

---

## 🚀 What is Content OS?

Content OS는 단순한 글 생성기가 아니다.

> **콘텐츠가 멈추지 않게 만드는 자동 운영 시스템이다**

핵심:

* 하나의 콘텐츠를 잘 만드는 것이 아니라
* **지속적으로 생성 → 검증 → 선택 → 개선하는 시스템**

---

## ⚙️ Core Flow

```text
Generate (N candidates)
        ↓
Validate (schema + quality)
        ↓
Filter (hard rules + threshold)
        ↓
Select (best candidate)
        ↓
Output
        ↓
Feedback Loop (성과 기반 진화)
```

---

## 🧠 Key Features

### 1. Multi-generation

* 한 번에 여러 개 콘텐츠 생성
* 단일 결과 의존 제거

---

### 2. Quality Evaluation

* LLM 기반 품질 평가
* readability / relevance / tone / originality

---

### 3. Quality Threshold

* 저품질 콘텐츠 자동 차단

---

### 4. Hard Filter

* 금지 표현 / 정책 위반 차단 (TS 기반)

---

### 5. Selection Strategy

* 여러 후보 중 최적 콘텐츠 선택
* 기본: quality_score 기반

---

### 6. Feedback Loop (🔥 핵심)

> **성과 기반으로 다음 콘텐츠 생성 전략을 바꾸는 시스템**

* CTR / 조회수 기반 규칙 생성
* 다음 generation에 반영

---

### 7. Reliability Layer

* JSON parse retry
* AppError (표준 에러 구조)
* Structured logging + traceId

---

## 📦 Project Structure

```text
content-os/
├── src/
│   ├── core/
│   ├── generator/
│   ├── transformer/
│   ├── validators/
│   ├── feedback/
│   ├── interfaces/
│   └── utils/
│
├── schemas/
├── templates/
├── outputs/
│   └── performance/
├── tests/
```

---

## 🛠 Installation

```sh
npm install
```

---

## ▶️ Usage (CLI)

### 1. Blog 생성

```sh
npx ts-node src/cli.ts generate \
  --type=blog \
  --template=seo-v1 \
  --context='{"topic":"강아지가 혀를 내미는 이유"}'
```

---

### 2. Multi-generation (추천)

```sh
npx ts-node src/cli.ts generate \
  --type=blog \
  --template=seo-v1 \
  --count=5 \
  --context='{"topic":"강아지 행동"}'
```

→ 내부적으로:

* 5개 생성
* 검증
* 필터링
* 최적 1개 선택

---

### 3. Blog → SNS 변환

```sh
npx ts-node src/cli.ts transform \
  --from=blog \
  --to=sns \
  --template=sns-transform \
  --input='{"title":"강아지 행동"}'
```

---

## 📤 Output Format

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

## 🔁 Feedback Loop — How It Actually Works

Feedback Loop는 자동으로 “마법처럼” 동작하는 게 아니다.

다음 3단계로 구성된다:

---

### 1. 성과 데이터 저장 (Manual / External)

성과 데이터는 다음 위치에 저장된다:

outputs/performance/

파일 예시:

```json
{
  "content_id": "blog-001",
  "type": "blog",
  "data": {
    "title": "강아지가 혀를 내미는 이유"
  },
  "meta": {
    "quality_score": 82
  },
  "metrics": {
    "views": 1200,
    "clicks": 300,
    "ctr": 0.25,
    "shares": 40
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

👉 이 데이터는:

* 수동으로 넣거나
* 외부 시스템 (analytics, backend 등)에서 생성한다

---

### 2. 규칙 생성 (Rule Extraction)

콘텐츠 생성 시, 시스템은 자동으로:

1. `outputs/performance/` 폴더를 읽고
2. 모든 성과 데이터를 수집한 뒤
3. 간단한 규칙을 생성한다

예:

```text
- CTR이 높은 콘텐츠 → 질문형 제목 사용
- 길이가 긴 콘텐츠 → 성과 낮음 → 짧게 작성
```

이 과정은:

```
src/feedback/ruleExtractor.ts
```

에서 수행된다.

---

### 3. 생성 시 자동 반영

콘텐츠 생성 시 (`generate`, `transform`):

```ts
context = {
  ...context,
  learned_rules: [...]
}
```

이 값이 prompt에 포함된다:

```text
LEARNED RULES:
- Prefer question-style titles
- Keep content shorter
```

---

## 🔄 전체 흐름

```
성과 데이터 저장
        ↓
ruleExtractor 실행
        ↓
learned_rules 생성
        ↓
prompt에 주입
        ↓
다음 콘텐츠 생성에 반영
```

---

## ❗ Important Notes

### 자동 수집이 아니다

Content OS는:

* 성과 데이터를 직접 수집하지 않는다
* (Google Analytics 등과 연결 필요)

---

### LLM 학습이 아니다

이 시스템은:

* 모델을 학습시키지 않는다
* 단지 prompt 전략을 변경한다

---

### MVP 상태

현재 Feedback Loop는:

* 간단한 rule 기반
* deterministic 로직

향후:

* embedding 기반 분석
* 자동 성과 수집
* 고급 전략 엔진

으로 확장 가능

---

## 💡 Example Workflow

1. 콘텐츠 생성

2. 블로그에 게시

3. 성과 수집 (views, ctr 등)

4. JSON 저장 → `outputs/performance/`

5. 다음 실행 시 자동 반영

---

### 3. Prompt에 반영됨

LEARNED RULES:

* Prefer question-style titles
* Keep content shorter

---

## 🔒 Quality Control

```ts
if (quality_score < threshold) {
  throw LOW_QUALITY
}
```

---

## 🧪 Testing

```sh
npx vitest
```

→ Gemini API 없이 실행 가능

---

## 🔌 LLM Integration

```text
ContentGenerator
ContentEvaluator
```

---

## 🧠 Architecture Summary

| Component | 역할 |
|----------|------|
| Generator | 콘텐츠 생성 |
| Validator | 품질 + schema 검증 |
| Transformer | 콘텐츠 변환 |
| Selector | 최적 후보 선택 |
| Feedback | 전략 학습 |

---

## ❗ Core Philosophy

> LLM은 결과를 만드는 존재가 아니다  
> → **후보를 만드는 존재다**

---

## 🚫 Not Included

* Laravel (Scheduler / Queue)
* DB
* API 인증
* Deduplication (향후)

---

## 🧭 Roadmap

* Advanced selection (multi-objective)
* Embedding 기반 deduplication
* 자동 성과 수집 (analytics 연동)
* Laravel orchestration

---

## 📌 Final Statement

> Content OS의 목적은 단 하나다

**“콘텐츠가 멈추지 않게 만드는 것”**
