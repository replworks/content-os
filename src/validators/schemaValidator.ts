import Ajv from "ajv";

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

export function validateSchema(schema: any, data: any) {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors,
    };
  }

  return { valid: true };
}
