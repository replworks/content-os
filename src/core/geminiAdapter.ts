import {
  ContentEvaluator,
  ContentGenerator,
} from '../interfaces/llm.interface';
import { model } from './gemini';

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
