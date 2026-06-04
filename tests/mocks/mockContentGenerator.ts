import { ContentGenerator } from "../../src/interfaces/llm.interface";

export class MockContentGenerator implements ContentGenerator {
  async generate(prompt: string): Promise<string> {
    // blog 생성 케이스
    if (prompt.includes('"type": "blog"')) {
      return JSON.stringify({
        title: "강아지가 혀를 내미는 이유",
        summary:
          "강아지가 혀를 내미는 이유는 체온 조절과 감정 표현, 소통을 위한 신호 등 여러 가지 이유가 복합적으로 작용하기 때문입니다.",
        body_markdown:
          "# 강아지 행동\n\n강아지가 혀를 내미는 이유는 단순히 더위를 식히기 위한 행동에서 시작됩니다. 주로 체온 조절을 위해 혀를 내밀지만, 그 외에도 긴장을 풀거나 주변과 소통하는 의사 표현으로 볼 수 있습니다. 혀를 내밀 때는 입 주변의 혈관이 확장되어 체온이 내려가며, 반려인의 관심을 끌기 위한 행동일 수도 있습니다.\n\n## 체온 조절\n\n강아지에게 땀샘은 발바닥에만 있으므로, 혀를 내미는 행동이 중요한 냉각 수단입니다. 혀를 통해 빠르게 공기를 순환시키고 침이 증발하며 체온을 낮춥니다.\n\n## 감정 표현\n\n때로는 혀를 내밀며 편안함이나 행복감을 표현합니다. 스트레스가 높거나 불안한 상황에서는 혀를 내미는 빈도가 달라질 수 있습니다.\n\n## 건강 신호\n\n지속적으로 혀를 내민다면 탈수나 과도한 스트레스 신호일 수 있으니 주의해야 합니다.",
        tags: ["강아지", "행동"],
        category: "반려동물",
        seo: {
          meta_title: "강아지는 왜 혀를 내밀까요?",
          meta_description:
            "강아지가 혀를 내미는 이유를 체온 조절, 감정 표현, 건강 신호 측면에서 상세히 설명합니다.",
        },
      });
    }

    // sns 변환 케이스
    if (prompt.includes('"type": "sns"') || prompt.includes("sns-transform")) {
      return JSON.stringify({
        platform: "twitter",
        content: "강아지가 혀를 내미는 이유는 체온 조절 때문입니다! 🐶",
        hashtags: ["#강아지", "#반려동물"],
      });
    }

    throw new Error("Unknown prompt type");
  }
}
