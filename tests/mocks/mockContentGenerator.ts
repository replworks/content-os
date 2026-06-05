import { ContentGenerator } from '../../src/interfaces/llm.interface';

export class MockContentGenerator implements ContentGenerator {
  async generate(prompt: string): Promise<string> {
    // blog 생성
    if (prompt.includes('"title"') && prompt.includes('body_markdown')) {
      return JSON.stringify({
        title: '강아지가 혀를 내미는 이유',
        summary: '강아지 행동 설명',
        body_markdown: '# 강아지\n내용...',
        tags: ['강아지'],
        category: 'pet',
        seo: {
          meta_title: '강아지 혀',
          meta_description: '설명',
        },
      });
    }

    // 🔥 transform 대응 (핵심)
    if (prompt.toLowerCase().includes('convert')) {
      return JSON.stringify({
        platform: 'twitter',
        content: '강아지가 혀를 내미는 이유 🐶',
        hashtags: ['#강아지', '#반려견'],
      });
    }

    throw new Error('MockContentGenerator: Unknown prompt');
  }
}
