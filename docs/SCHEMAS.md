# Content OS — Schemas

---

## 1. Purpose

Schemas define the `data` payload shape for generated content.
They are loaded from `schemas/<type>.schema.json`.

---

## 2. Loading

`loadSchema(type)`:

* reads `schemas/<type>.schema.json`
* throws if the file does not exist

---

## 3. Supported schemas

### blog

File: `schemas/blog.schema.json`

* required: `title`, `summary`, `body_markdown`
* additionalProperties: `false`
* `title`: string, 10-120 chars
* `summary`: string, 30-200 chars
* `body_markdown`: string, min 300 chars
* optional `tags`: array of 1-10 strings, each 2-30 chars
* optional `category`: string, 2-50 chars
* optional `seo`: object with `meta_title` and `meta_description`
  * `meta_title`: string, 10-70 chars
  * `meta_description`: string, 50-160 chars

---

### sns

File: `schemas/sns.schema.json`

* required: `platform`, `content`
* additionalProperties: `false`
* `platform`: enum of `twitter`, `facebook`, `instagram`, `linkedin`
* `content`: string, 10-300 chars
* optional `hashtags`: array of 0-10 strings matching `^#.+`
* optional `source_ref`: string

---

## 4. Rules

* `additionalProperties` is false for supported schemas.
* Required fields must be present.
* Field constraints are enforced by AJV.
* Unsupported types are not defined in the repository.
