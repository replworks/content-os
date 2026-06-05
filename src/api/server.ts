import Fastify, { type FastifyReply } from 'fastify';
import { ENV } from '../config/env.ts';
import { runGenerate } from '../core/runGenerate.ts';
import { runGenerateMany } from '../core/runGenerateMany.ts';
import { runTransform } from '../core/runTransform.ts';
import { AppError, ERROR_CODES } from '../core/errors.ts';
import type {
  ContentEvaluator,
  ContentGenerator,
} from '../interfaces/llm.interface.ts';
import type { ContentType, Meta } from '../core/types.ts';

declare module 'fastify' {
  interface FastifyRequest {
    traceId: string;
  }
}

type ApiErrorResponse = {
  traceId: string;
  error: {
    code: string;
    message: string;
  };
};

type CandidateListResponse = {
  traceId: string;
  type: ContentType;
  candidates: Array<{ data: unknown; meta: Meta }>;
  defaultWinnerIndex: number;
};

type EnvelopeResponse = {
  traceId: string;
  type: ContentType;
  data: unknown;
  meta: Meta;
};

type GenerateResponse = EnvelopeResponse | CandidateListResponse;

type GenerateRequest = {
  type: ContentType;
  templateId: string;
  context: Record<string, unknown>;
  mode?: 'single' | 'candidates';
  count?: number;
  topK?: number;
};

type TransformRequest = {
  from: ContentType;
  to: ContentType;
  templateId: string;
  input: unknown;
  context?: Record<string, unknown>;
};

type ServerDeps = {
  generator: ContentGenerator;
  evaluator: ContentEvaluator;
};

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';
const VALID_KEYS = new Set([process.env.API_KEY]);

function createTraceId() {
  return Math.random().toString(36).slice(2);
}

function getStatusCode(code: string) {
  switch (code) {
    case ERROR_CODES.VALIDATION_ERROR:
      return 400;
    case ERROR_CODES.JSON_PARSE_ERROR:
      return 500;
    case ERROR_CODES.LLM_ERROR:
      return 502;
    case ERROR_CODES.HARD_FILTER_FAILED:
      return 422;
    default:
      return 500;
  }
}

function sendError(
  reply: FastifyReply,
  traceId: string,
  code: string,
  message: string
) {
  return reply.status(getStatusCode(code)).send({
    traceId,
    error: {
      code,
      message,
    },
  } satisfies ApiErrorResponse);
}

export function buildServer({ generator, evaluator }: ServerDeps) {
  const fastify = Fastify({
    logger: true,
  });

  fastify.addHook('onRequest', async (request) => {
    request.traceId = createTraceId();
    request.log.info({ traceId: request.traceId }, 'request:start');
  });

  fastify.addHook('preHandler', async (request, reply) => {
    if (!AUTH_ENABLED) return;
    if (request.url === '/health') return;

    const apiKey = request.headers['x-api-key'];

    if (!VALID_KEYS.has(apiKey as string)) {
      return sendError(reply, request.traceId, 'UNAUTHORIZED', 'Unauthorized');
    }
  });

  fastify.get('/health', async (request) => {
    request.log.info({ traceId: request.traceId }, 'request:end');
    return { status: 'ok' };
  });

  fastify.post<{
    Body: GenerateRequest;
    Reply: GenerateResponse | ApiErrorResponse;
  }>('/generate', async (request, reply) => {
    const { traceId } = request;

    try {
      const { type, templateId, context, mode, count, topK } = request.body;

      if (!type || !templateId || !context) {
        return sendError(
          reply,
          traceId,
          ERROR_CODES.VALIDATION_ERROR,
          'type, templateId, context are required'
        );
      }

      if (mode === 'candidates') {
        const result = await runGenerateMany({
          type,
          templateId,
          context,
          generator,
          evaluator,
          traceId,
          count,
          topK,
          mode: 'candidates',
        });

        request.log.info({ traceId, type, mode }, 'request:end');

        return {
          traceId,
          ...result,
        };
      }

      const result = await runGenerate({
        type,
        templateId,
        context,
        generator,
        evaluator,
        traceId,
      });

      request.log.info({ traceId, type }, 'request:end');

      return {
        traceId,
        type: result.type,
        data: result.data,
        meta: result.meta,
      };
    } catch (err) {
      const error =
        err instanceof AppError
          ? err
          : new AppError(
              ERROR_CODES.UNKNOWN_ERROR,
              err instanceof Error ? err.message : 'Unknown error'
            );

      request.log.error({
        traceId,
        code: error.code,
        message: error.message,
        context: { route: '/generate' },
      });

      return sendError(reply, traceId, error.code, error.message);
    }
  });

  fastify.post<{
    Body: TransformRequest;
    Reply: EnvelopeResponse | ApiErrorResponse;
  }>('/transform', async (request, reply) => {
    const { traceId } = request;

    try {
      const { from, to, templateId, input, context } = request.body;

      if (!from || !to || !templateId || typeof input === 'undefined') {
        return sendError(
          reply,
          traceId,
          ERROR_CODES.VALIDATION_ERROR,
          'from, to, templateId, input are required'
        );
      }

      const result = await runTransform({
        from,
        to,
        templateId,
        input,
        context: context ?? {},
        generator,
        evaluator,
      });

      request.log.info({ traceId, from, to }, 'request:end');

      return {
        traceId,
        type: result.type,
        data: result.data,
        meta: result.meta,
      };
    } catch (err) {
      const error =
        err instanceof AppError
          ? err
          : new AppError(
              ERROR_CODES.UNKNOWN_ERROR,
              err instanceof Error ? err.message : 'Unknown error'
            );

      request.log.error({
        traceId,
        code: error.code,
        message: error.message,
        context: { route: '/transform' },
      });

      return sendError(reply, traceId, error.code, error.message);
    }
  });

  return fastify;
}

const start = async () => {
  const { GeminiContentEvaluator, GeminiContentGenerator } =
    await import('../core/geminiAdapter.ts');

  const fastify = buildServer({
    generator: new GeminiContentGenerator(),
    evaluator: new GeminiContentEvaluator(),
  });

  try {
    fastify.log.info(
      {
        code: 'CONFIG_LOADED',
        env: ENV,
      },
      'config:loaded'
    );

    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    });

    fastify.log.info(
      {
        code: 'SERVER_START',
        message: 'Content OS API running on http://localhost:3000',
      },
      'server:start'
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export { start };
