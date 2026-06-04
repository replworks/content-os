import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelNAME = process.env.MODEL_NAME;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

if (!modelNAME) {
  throw new Error('MODEL_NAME is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: modelNAME,
  generationConfig: {
    responseMimeType: 'application/json',
  },
});
