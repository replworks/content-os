import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError, ERROR_CODES } from './errors.ts';

const apiKey = process.env.GEMINI_API_KEY;
const modelNAME = process.env.MODEL_NAME;

if (!apiKey) {
  throw new AppError(ERROR_CODES.LLM_ERROR, 'GEMINI_API_KEY is not set');
}

if (!modelNAME) {
  throw new AppError(ERROR_CODES.LLM_ERROR, 'MODEL_NAME is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: modelNAME,
  generationConfig: {
    responseMimeType: 'application/json',
  },
});
