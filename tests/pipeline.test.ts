import { describe, it, expect } from "vitest";
import { runGenerate } from "../src/core/runGenerate";

describe("Pipeline", () => {
  it("should generate validated blog content", async () => {
    const result = await runGenerate({
      type: "blog",
      templateId: "seo-v1",
      context: {
        topic: "강아지가 혀를 내미는 이유",
        audience: "초보 반려인",
      },
    });

    expect(result.data).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta.quality_score).toBeTypeOf("number");
  });
});
