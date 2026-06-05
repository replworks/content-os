# Content OS - Schemas

## 1. Purpose

Schemas define the `data` payload returned by generation and transformation.
They are loaded from `schemas/<type>.schema.json`.

`loadSchema(type)` reads the matching file from `schemas/` and throws `SCHEMA_NOT_FOUND` if the file is missing.

## 2. Schema Validation

Validation uses AJV.

* schema validation happens before quality evaluation
* schema failures return `{ valid: false, errors }`
* `runGenerate()` and `runTransform()` convert invalid validation results into `VALIDATION_ERROR`

## 3. Supported Schemas

### `blog`

File: `schemas/blog.schema.json`

```json
{
  "type": "object",
  "required": ["title", "summary", "body_markdown"],
  "additionalProperties": false
}
```

Properties:

* `title`: string, 10-120 chars
* `summary`: string, 30-200 chars
* `body_markdown`: string, min 300 chars
* `tags`: optional array of 1-10 strings, each 2-30 chars
* `category`: optional string, 2-50 chars
* `seo`: optional object with `meta_title` and `meta_description`
  * `meta_title`: string, 10-70 chars
  * `meta_description`: string, 50-160 chars

### `sns`

File: `schemas/sns.schema.json`

```json
{
  "type": "object",
  "required": ["platform", "content"],
  "additionalProperties": false
}
```

Properties:

* `platform`: enum of `twitter`, `facebook`, `instagram`, `linkedin`
* `content`: string, 10-300 chars
* `hashtags`: optional array of 0-10 strings matching `^#.+`
* `source_ref`: optional string

## 4. Actual Requirements

* `additionalProperties` is `false` in both supported schemas.
* Required fields must be present.
* Type and length constraints are enforced by AJV.
* No other schema types are defined in the repository.
