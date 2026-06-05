# Content OS - Context

## 1. Purpose

Context is arbitrary JSON passed into prompt builders. It is not validated by output schema.

## 2. Generate Context

`generate()` accepts:

```ts
{
  type: string;
  templateId: string;
  context: any;
  generator: ContentGenerator;
  traceId?: string;
}
```

The context is passed directly to the generation prompt builder.

## 3. Transform Context

`transform()` accepts:

```ts
{
  from: string;
  to: string;
  templateId: string;
  input: any;
  context: any;
  generator: ContentGenerator;
  traceId?: string;
}
```

The actual prompt context is:

* `source: input`
* all fields from `context` spread after `source`

Because `context` is spread last, any `source` key inside `context` overrides the injected `source` value.

## 4. Rules

* `context` is not schema-validated.
* `context` can be any JSON-compatible value.
* The prompt builder serializes `context` into the LLM prompt.
* `transform()` always includes `source: input` in the prompt context.

## 5. Practical Use

Common examples are free-form and not contractually enforced, for example:

* topic
* audience
* tone
* goal

These fields are usage patterns only, not required fields.
