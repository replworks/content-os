import Fastify from 'fastify';
import { runGenerate } from '../core/runGenerate.ts';
import { runTransform } from '../core/runTransform.ts';
import {
  GeminiContentEvaluator,
  GeminiContentGenerator,
} from '../core/geminiAdapter.ts';
import { AppError, ERROR_CODES } from '../core/errors.ts';
import type { ContentType, Meta } from '../core/types.ts';
import type { FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    traceId: string;
  }
}

const fastify = Fastify({
  logger: true,
});

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

type ApiErrorResponse = {
  traceId: string;
  error: {
    code: string;
    message: string;
  };
};

type GenerateRequest = {
  type: ContentType;
  templateId: string;
  context: Record<string, unknown>;
};

type TransformRequest = {
  from: ContentType;
  to: ContentType;
  templateId: string;
  input: unknown;
  context?: Record<string, unknown>;
};

type EnvelopeResponse = {
  traceId: string;
  type: ContentType;
  data: unknown;
  meta: Meta;
};

const generator = new GeminiContentGenerator();
const evaluator = new GeminiContentEvaluator();

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
  Reply: EnvelopeResponse | ApiErrorResponse;
}>('/generate', async (request, reply) => {
  const { traceId } = request;

  try {
    const { type, templateId, context } = request.body;

    if (!type || !templateId || !context) {
      return sendError(
        reply,
        traceId,
        ERROR_CODES.VALIDATION_ERROR,
        'type, templateId, context are required'
      );
    }

    const result = await runGenerate({
      type,
      templateId,
      context,
      generator,
      evaluator,
    });

    request.log.info({ traceId, type }, 'request:end');

    return {
      traceId,
      type: result.type,
      data: result.data,
      meta: result.meta,
    };
  } catch (err) {
    request.log.error({ traceId, err }, 'request:error');

    if (err instanceof AppError) {
      return sendError(reply, traceId, err.code, err.message);
    }

    return sendError(
      reply,
      traceId,
      'UNKNOWN_ERROR',
      err instanceof Error ? err.message : 'Unknown error'
    );
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
    request.log.error({ traceId, err }, 'request:error');

    if (err instanceof AppError) {
      return sendError(reply, traceId, err.code, err.message);
    }

    return sendError(
      reply,
      traceId,
      'UNKNOWN_ERROR',
      err instanceof Error ? err.message : 'Unknown error'
    );
  }
});

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
