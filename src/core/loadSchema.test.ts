import { describe, it, expect } from "vitest";
import { loadSchema } from "./loadSchema";

describe("Loaders", () => {
  it("should load blog schema", () => {
    const schema = loadSchema("blog");

    expect(schema).toBeDefined();
    expect(schema.type).toBe("object");
  });

  it("should throw if schema not found", () => {
    expect(() => loadSchema("invalid")).toThrow();
  });
});
