import { runGenerate } from '../src/core/runGenerate.ts';
import { runTransform } from '../src/core/runTransform.ts';
import {
  GeminiContentGenerator,
  GeminiContentEvaluator,
} from '../src/core/geminiAdapter.ts';
import fs from 'fs';
import path from 'path';

async function main() {
  const generator = new GeminiContentGenerator();
  const evaluator = new GeminiContentEvaluator();

  // 1. blog 생성
  const blog = await runGenerate({
    type: 'blog',
    templateId: 'seo-v1',
    context: {
      topic: '강아지가 혀를 내미는 이유',
      audience: '초보 반려인',
    },
    generator,
    evaluator,
  });

  // 2. sns 변환
  const sns = await runTransform({
    from: 'blog',
    to: 'sns',
    templateId: 'sns-transform',
    input: blog.data,
    context: {},
    generator,
    evaluator,
  });

  // 저장
  const blogFile = `blog-${Date.now()}.json`;
  const snsFile = `sns-${Date.now()}.json`;

  fs.writeFileSync(
    path.join('outputs', blogFile),
    JSON.stringify(blog, null, 2)
  );

  fs.writeFileSync(path.join('outputs', snsFile), JSON.stringify(sns, null, 2));

  console.log('Saved:', blogFile, snsFile);
}

main();
