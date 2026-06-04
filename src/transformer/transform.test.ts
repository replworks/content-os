import { describe, it, expect } from "vitest";
import { runGenerate } from "../core/runGenerate";
import { runTransform } from "../core/runTransform";
import { MockContentGenerator } from "../../tests/mocks/mockContentGenerator";
import { MockContentEvaluator } from "../../tests/mocks/mockContentEvaluator";

describe("Transform", () => {
  it("should convert blog to sns", async () => {
    const generator = new MockContentGenerator();
    const evaluator = new MockContentEvaluator();

    const blog = await runGenerate({
      type: "blog",
      templateId: "seo-v1",
      context: {
        topic: "강아지가 혀를 내미는 이유",
        audience: "초보 반려인",
      },
      generator,
      evaluator,
    });

    const sns = await runTransform({
      from: "blog",
      to: "sns",
      templateId: "sns-transform",
      input: blog.data,
      generator,
      evaluator, // ✅ FIX
    });

    expect(sns.data).toBeDefined();
    expect(sns.data.content).toBeDefined();
    expect(sns.meta.quality_score).toBeTypeOf("number");
  });
});
