import fs from 'fs';
import path from 'path';
import { AppError } from '../src/core/errors.ts';
import { runGenerate } from '../src/core/runGenerate.ts';
import { runTransform } from '../src/core/runTransform.ts';
import {
  GeminiContentGenerator,
  GeminiContentEvaluator,
} from '../src/core/geminiAdapter.ts';

function createTraceId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function printError(traceId: string, err: unknown) {
  if (err instanceof AppError) {
    console.error(`[ERROR] [traceId=${traceId}] ${err.code}: ${err.message}`);
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error(`[ERROR] [traceId=${traceId}] UNKNOWN_ERROR: ${message}`);
}

async function main() {
  const traceId = createTraceId();
  const generator = new GeminiContentGenerator();
  const evaluator = new GeminiContentEvaluator();

  try {
    const blog = await runGenerate({
      type: 'blog',
      templateId: 'seo-v1',
      context: {
        topic: '강아지가 혀를 내미는 이유',
        audience: '초보 반려인',
      },
      generator,
      evaluator,
      traceId,
    });

    const sns = await runTransform({
      from: 'blog',
      to: 'sns',
      templateId: 'sns-transform',
      input: blog.data,
      context: {},
      generator,
      evaluator,
      traceId,
    });

    const blogFile = `blog-${Date.now()}.json`;
    const snsFile = `sns-${Date.now()}.json`;

    fs.writeFileSync(
      path.join(process.cwd(), 'outputs', blogFile),
      JSON.stringify(blog, null, 2)
    );

    fs.writeFileSync(
      path.join(process.cwd(), 'outputs', snsFile),
      JSON.stringify(sns, null, 2)
    );

    console.log(`[traceId=${traceId}]`);
    console.log('✔ Content generated');
    console.log('✔ Type: blog');
    console.log(`✔ Saved to: outputs/${blogFile}`);
    console.log(`✔ Saved to: outputs/${snsFile}`);

    process.exit(0);
  } catch (err) {
    printError(traceId, err);
    process.exit(1);
  }
}

main();
