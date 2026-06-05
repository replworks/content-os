import fs from 'fs';
import path from 'path';
import { AppError, ERROR_CODES } from '../src/core/errors.ts';
import { runGenerate } from '../src/core/runGenerate.ts';
import { runTransform } from '../src/core/runTransform.ts';
import {
  GeminiContentGenerator,
  GeminiContentEvaluator,
} from '../src/core/geminiAdapter.ts';

function createTraceId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getExitCode(err: unknown) {
  if (err instanceof AppError) {
    if (err.code === ERROR_CODES.VALIDATION_ERROR) return 1;
    if (err.code === ERROR_CODES.JSON_PARSE_ERROR) return 2;
    if (err.code === ERROR_CODES.LLM_ERROR) return 3;
    return 9;
  }

  return 9;
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
    } as any);

    const sns = await runTransform({
      from: 'blog',
      to: 'sns',
      templateId: 'sns-transform',
      input: blog.data,
      context: {},
      generator,
      evaluator,
      traceId,
    } as any);

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
    const exitCode = getExitCode(err);

    console.log(`[traceId=${traceId}]`);

    if (err instanceof AppError) {
      console.log(`✖ ERROR: ${err.code}`);
      console.log(`Message: ${err.message}`);
    } else {
      console.log('✖ ERROR: UNKNOWN_ERROR');
      console.log(`Message: ${(err as any)?.message ?? String(err)}`);
    }

    process.exit(exitCode);
  }
}

main();
