# Content OS — Templates

---

## 1. Purpose

Templates are JSON artifacts loaded from `templates/<type>/<templateId>.json`.
They are serialized into LLM prompts along with schema and context.

---

## 2. Loading

`loadTemplate(type, templateId)`:

* reads `templates/<type>/<templateId>.json`
* throws if the file does not exist

---

## 3. Prompt usage

* `buildPrompt({ schema, template, context })` is used for generation.
* `buildTransformPrompt({ schema, template, input, context })` is used for transform.
* The code does not enforce a fixed template schema.

---

## 4. Supported templates

### blog/seo-v1

Fields:

* `id`
* `type`: `blog`
* `intent`
* `structure`
* `writing_rules`
* `constraints`

### blog/list-v1

Fields:

* `id`
* `type`: `blog`
* `intent`
* `structure`
* `writing_rules`
* `constraints`

### sns/sns-transform

Fields:

* `id`
* `type`: `sns`
* `intent`
* `structure`
* `writing_rules`
* `constraints`

---

## 5. Notes

* Templates are used for instruction guidance in prompts.
* No runtime enforcement exists for template field content.
