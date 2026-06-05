import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: true,
  strict: true,
});

export function validateSchema(schema: unknown, data: unknown) {
  const validate = ajv.compile(schema as object);

  const valid = validate(data);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors,
    };
  }

  return { valid: true };
}
