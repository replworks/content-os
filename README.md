# Content OS

> **LLM을 “콘텐츠 생성 도구”가 아니라
> “멈추지 않는 콘텐츠 운영 시스템”으로 만드는 엔진**

---

## 🚀 What is Content OS?

Content OS는 단순한 글 생성기가 아니다.

> **콘텐츠가 멈추지 않게 만드는 자동 운영 시스템이다**

핵심 개념:

* 콘텐츠를 “한 개 잘 만드는 것”이 아니라
* **지속적으로 생성 → 검증 → 필터링하는 구조**

---

## ⚙️ Core Concept

```text
Generate → Validate → Filter → Output
              ↓
         Transform → Validate
```

---

## 🧠 Key Features

* Schema 기반 콘텐츠 생성 (JSON-first)
* LLM 추상화 (DI 구조)
* 자동 품질 평가 (LLM evaluator)
* Quality threshold 기반 필터링
* Hard Filter (TS 기반 안전 필터)
* JSON parse retry (안정성)
* Structured logging + traceId
* 테스트 (LLM 없이 실행 가능)

---

## 📦 Project Structure

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

## 🛠 Installation

```bash
npm install
```

---

## ▶️ Usage (CLI)

### 1. Blog 생성

```bash
npx ts-node src/cli.ts generate \
  --type=blog \
  --template=seo-v1 \
  --context='{"topic":"강아지가 혀를 내미는 이유"}'
```

---

### 2. Blog → SNS 변환

```bash
npx ts-node src/cli.ts transform \
  --from=blog \
  --to=sns \
  --template=sns-transform \
  --input='{"title":"강아지 행동"}'
```

---

## 📤 Output Format

모든 결과는 동일한 구조를 따른다:

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

## 🔒 Quality Control

Content OS는 저품질 콘텐츠를 자동으로 차단한다.

```ts
if (quality_score < threshold) {
  throw LOW_QUALITY
}
```

### Threshold 설정

```ts
export const QUALITY_THRESHOLD = {
  blog: 70,
  sns: 60,
  default: 65,
};
```

---

## 🧪 Testing

LLM 없이 테스트 가능:

```bash
npx vitest
```

---

## 🔌 LLM Integration

LLM은 직접 호출하지 않는다.

```ts
ContentGenerator
ContentEvaluator
```

예시:

```ts
const generator = new GeminiContentGenerator();
```

---

## 🧱 Architecture

핵심 구조:

* Generator → 콘텐츠 생성
* Validator → schema + quality 검증
* Transformer → 콘텐츠 변환
* Pipeline → 실행 orchestration

---

## ❗ Important Design Principle

> LLM은 “결과를 만드는 존재”가 아니다
> → **후보를 만드는 존재다**

Content OS는:

* 여러 결과를 만들고
* 검증하고
* 필터링한다

---

## 🚫 Not Included

* Scheduler (Laravel에서 처리)
* DB
* API 인증
* Deduplication (향후 추가)

---

## 🧭 Roadmap

다음 단계:

* Multi-generation (N개 생성)
* Ranking / Selection
* Feedback loop (성과 기반 최적화)

---

## 📌 Final Statement

> Content OS의 목적은 단 하나다

**“콘텐츠가 멈추지 않게 만드는 것”**
