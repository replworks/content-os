# Content OS — Context

---

## 1. Overview

Context is the JSON input passed to prompt builders.
It is not validated by output schema; the generated content is validated instead.

---

## 2. Code behavior

`generate()` accepts:

```ts
{
  type: string;
  templateId: string;
  context: any;
  generator: ContentGenerator;
}
```

`transform()` accepts:

```ts
{
  from: string;
  to: string;
  templateId: string;
  input: any;
  context: any;
  generator: ContentGenerator;
}
```

`transform()` passes `context` to the prompt builder as:

```ts
{ source: input, ...context }
```

---

## 3. Rules

* `context` is arbitrary JSON.
* Code does not enforce a fixed context schema.
* The prompt builder serializes `context` into the LLM prompt.
* Output schema validation is separate from context shape.

---

## 4. Common usage

The repository uses examples such as:

```json
{
  "topic": "강아지가 혀를 내미는 이유",
  "audience": "초보 반려인"
}
```

This is a common pattern, but not a required contract.

---

## 5. Transform context

For transform operations, the actual prompt context is:

```json
{
  "source": { ...input },
  ...context
}
```

The `source` field is required by the current transform prompt builder.

---

## 6. Context vs template

* `context` defines what to write.
* `template` defines how to write it.

Prompt builders combine `schema`, `template`, and `context`.
