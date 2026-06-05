import type { ContentGenerator } from '../../src/interfaces/llm.interface.ts';

export class MockContentGenerator implements ContentGenerator {
  async generate(prompt: string): Promise<string> {
    // 🔥 transform 대응 (핵심)
    if (prompt.toLowerCase().includes('convert')) {
      return JSON.stringify({
        platform: 'twitter',
        content: '강아지가 혀를 내미는 이유 🐶',
        hashtags: ['#강아지', '#반려견'],
      });
    }

    // blog 생성
    if (prompt.includes('"title"') && prompt.includes('body_markdown')) {
      return JSON.stringify({
        title: '강아지가 혀를 내미는 이유와 건강 신호',
        summary:
          '강아지가 혀를 내미는 이유를 행동, 체온 조절, 긴장, 건강 신호 관점에서 설명하는 요약입니다.',
        body_markdown: `# 강아지가 혀를 내미는 이유

강아지가 혀를 내미는 모습은 아주 흔합니다. 많은 보호자들이 이 행동을 단순히 귀엽다고 느끼지만, 실제로는 여러 의미를 가질 수 있습니다.

첫째, 체온 조절입니다. 강아지는 사람처럼 땀을 많이 흘리지 않기 때문에 혀를 내밀고 헥헥거리며 몸의 열을 식힙니다.

둘째, 편안함의 표현일 수 있습니다. 긴장이 풀렸을 때 혀가 살짝 밖으로 나오는 경우가 있습니다.

셋째, 주의가 필요한 신호일 수도 있습니다. 과도하게 혀를 내밀거나 침을 많이 흘린다면 건강 상태를 확인해보는 것이 좋습니다.

따라서 단순히 한 번의 행동만 보고 판단하기보다, 전반적인 상태와 함께 살펴보는 것이 중요합니다.
`,
        tags: ['강아지'],
        category: 'pet',
        seo: {
          meta_title: '강아지가 혀를 내미는 이유',
          meta_description:
            '강아지가 혀를 내미는 이유를 체온 조절, 편안함, 긴장 완화, 건강 신호 관점에서 자세히 설명합니다.',
        },
      });
    }

    throw new Error('MockContentGenerator: Unknown prompt');
  }
}
