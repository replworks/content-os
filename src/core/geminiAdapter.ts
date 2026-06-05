import type {
  ContentEvaluator,
  ContentGenerator,
} from '../interfaces/llm.interface.ts';
import { model } from './gemini.ts';

export class GeminiContentGenerator implements ContentGenerator {
  async generate(prompt: string): Promise<string> {
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export class GeminiContentEvaluator implements ContentEvaluator {
  async evaluate(prompt: string): Promise<string> {
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
