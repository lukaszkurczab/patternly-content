class SchemaValidationError extends Error {
  constructor(message) {
    super(`INVALID_SCHEMA: ${message}`);
    this.code = "INVALID_SCHEMA";
  }
}

function canonical(value) {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Only JSON values are canonicalizable.");
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

export async function validateSchema(value, schema, label = "document", rootSchema = schema, pointer = "") {
  if (schema?.$ref) {
    const target = schema.$ref.startsWith("#/") ? schema.$ref.slice(2).split("/").reduce((node, key) => node?.[key.replaceAll("~1", "/").replaceAll("~0", "~")], rootSchema) : undefined;
    if (!target) throw new SchemaValidationError(`${label} has an unresolved schema reference ${schema.$ref}.`);
    return validateSchema(value, target, label, rootSchema, schema.$ref);
  }
  if (schema?.const !== undefined && value !== schema.const) throw new SchemaValidationError(`${label} must equal ${JSON.stringify(schema.const)}.`);
  if (schema?.enum && !schema.enum.includes(value)) throw new SchemaValidationError(`${label} is outside its schema enum.`);
  if (schema?.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new SchemaValidationError(`${label} must be an object.`);
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) throw new SchemaValidationError(`${label}.${key} is required.`);
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties ?? {}, key)) throw new SchemaValidationError(`${label}.${key} is not allowed.`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (value[key] !== undefined) await validateSchema(value[key], child, `${label}.${key}`, rootSchema, pointer);
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") for (const [key, child] of Object.entries(value)) if (!Object.hasOwn(schema.properties ?? {}, key)) await validateSchema(child, schema.additionalProperties, `${label}.${key}`, rootSchema, pointer);
    return;
  }
  if (schema?.type === "array") {
    if (!Array.isArray(value)) throw new SchemaValidationError(`${label} must be an array.`);
    if (schema.minItems !== undefined && value.length < schema.minItems) throw new SchemaValidationError(`${label} must contain at least ${schema.minItems} entries.`);
    if (schema.uniqueItems && new Set(value.map(canonical)).size !== value.length) throw new SchemaValidationError(`${label} must contain unique entries.`);
    if (schema.items) for (const [index, child] of value.entries()) await validateSchema(child, schema.items, `${label}[${index}]`, rootSchema, pointer);
    return;
  }
  if (schema?.type === "string" && (typeof value !== "string" || (schema.minLength !== undefined && value.length < schema.minLength))) throw new SchemaValidationError(`${label} must be a non-empty string.`);
  if (schema?.type === "integer" && !Number.isInteger(value)) throw new SchemaValidationError(`${label} must be an integer.`);
  if (schema?.type === "boolean" && typeof value !== "boolean") throw new SchemaValidationError(`${label} must be boolean.`);
}
