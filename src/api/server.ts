import Fastify from 'fastify';
import { generate } from '../generator/generate.ts';
import { GeminiContentGenerator } from '../core/geminiAdapter.ts';

const fastify = Fastify({
  logger: true,
});

// ✅ generator DI
const generator = new GeminiContentGenerator();

// 타입 정의
type GenerateRequest = {
  type: string;
  templateId: string;
  context: any;
};

type GenerateResponse = {
  type: string;
  data: any;
  meta: any;
};

// ✅ /generate
fastify.post<{
  Body: GenerateRequest;
  Reply: GenerateResponse | { error: string; message?: string };
}>('/generate', async (request, reply) => {
  try {
    const { type, templateId, context } = request.body;

    // 🔒 Hard validation (API 레벨)
    if (!type || !templateId || !context) {
      return reply.status(400).send({
        error: 'INVALID_INPUT',
        message: 'type, templateId, context are required',
      });
    }

    // 1️⃣ Generator 실행 (LLM 호출)
    const data = await generate({
      type,
      templateId,
      context,
      generator, // 🔥 여기 중요
    });

    // 2️⃣ Validator 연결 자리 (아직 없으니까 placeholder)
    const meta = {
      quality_score: 0,
      dimensions: {},
      warnings: [],
    };

    // 3️⃣ Envelope 반환
    return {
      type,
      data,
      meta,
    };
  } catch (err: any) {
    request.log.error(err);

    // 🔥 에러 타입 분리 추천
    if (err.message.includes('JSON')) {
      return reply.status(500).send({
        error: 'JSON_PARSE_ERROR',
        message: err.message,
      });
    }

    return reply.status(500).send({
      error: 'GENERATION_FAILED',
      message: err.message,
    });
  }
});

// 서버 시작
const start = async () => {
  try {
    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    });

    console.log('🚀 Content OS API running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
