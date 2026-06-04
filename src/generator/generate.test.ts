import { describe, it, expect } from "vitest";
import { generate } from "./generate";

describe("Generator", () => {
  it("should generate blog json", async () => {
    const result = await generate({
      type: "blog",
      templateId: "seo-v1",
      context: {
        topic: "강아지가 혀를 내미는 이유",
        audience: "초보 반려인",
      },
    });

    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.body_markdown).toBeDefined();
  });
});
