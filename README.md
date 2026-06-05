# Content OS

> **LLM을 “콘텐츠 생성 도구”가 아니라  
> “멈추지 않는 콘텐츠 운영 시스템”으로 만드는 엔진**

---

## 🚀 What is Content OS?

Content OS는 단순한 글 생성기가 아니다.

> **콘텐츠가 멈추지 않게 만드는 자동 생산 엔진이다**

핵심은:

* 한 번 잘 만드는 것이 아니라
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
* Multi-generation (N개 생성 + 선택)
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
├── docs/
│   └── INTEGRATION.md
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

### 3. Multi-generation (추천)

```bash
npx ts-node src/cli.ts generateMany \
  --type=blog \
  --template=seo-v1 \
  --context='{"topic":"강아지 행동"}' \
  --count=5 \
  --topK=2
```

설명:

* count: 생성 후보 수
* topK: 검증 대상 수
* 최종 결과는 quality_score 기준으로 선택됨

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

## 🔒 Quality Control

저품질 콘텐츠는 자동 차단된다.

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

## ⚙️ Config System (Environment-based Settings)

Content OS는 실행 파라미터를 코드에 하드코딩하지 않고  
**환경별 설정(config)** 으로 관리한다.

---

### 📁 Config 구조

```bash
src/config/
├── base.ts
├── dev.ts
├── prod.ts
└── index.ts
```

---

### 🧩 설정 항목

```ts
export const config = {
  qualityThreshold: {
    blog: 70,
    sns: 60,
    default: 65,
  },
  generation: {
    count: 5,
    topK: 2,
  },
};
```

---

### 🌍 환경별 설정

```bash
NODE_ENV=development
NODE_ENV=production
```

#### dev

```ts
export const devConfig = {
  generation: {
    count: 2,
    topK: 1,
  },
};
```

#### prod

```ts
export const prodConfig = {
  generation: {
    count: 5,
    topK: 2,
  },
};
```

---

### 🔌 실행 시 동작

```ts
import { config } from "../config";

const threshold = config.qualityThreshold[type];
const count = config.generation.count;
const topK = config.generation.topK;
```

---

### 🧪 CLI에서 환경 지정

```bash
NODE_ENV=development npx ts-node src/cli.ts generate ...
NODE_ENV=production npx ts-node src/cli.ts generateMany ...
```

---

### ❗ 설계 원칙

* config는 단일 source of truth
* runtime에서 숫자 하드코딩 금지

---

## 🧪 Testing

```bash
npx vitest
```

---

## 🔌 LLM Integration

```ts
ContentGenerator
ContentEvaluator
```

---

## 🧱 Architecture (요약)

```text
runGenerate -> generate -> runLLMTask -> hardFilter -> validate -> envelope
runGenerateMany -> generateMany -> hardFilter -> topK -> validate -> select
runTransform -> transform -> runLLMTask -> hardFilter -> validate
```

---

## ❗ Responsibility Split

### ✅ TS Core

* generation
* validation
* filtering
* quality scoring
* selection

---

### 🚫 Not in TS

* performance tracking
* DB
* scheduling
* publishing
* optimization

---

## 🔗 Integration (Laravel)

👉 반드시 읽어야 하는 문서:

```
docs/INTEGRATION.md
```

Laravel은 다음을 담당한다:

* 콘텐츠 발행
* 성과 수집 (views, CTR 등)
* ranking override
* feedback loop
* context 생성

---

## 🔁 Feedback Loop (External)

```text
Generate → Output(JSON)
               ↓
        Publish (Laravel)
               ↓
        Performance 수집
               ↓
        Feedback 저장
               ↓
        Context 생성
               ↓
Generate(context 포함)
```

---

## ❗ Design Principle

> LLM은 결과를 만드는 존재가 아니다  
> → 후보를 만드는 존재다

---

## 📌 Final Statement

**“콘텐츠가 멈추지 않게 만드는 것”**
