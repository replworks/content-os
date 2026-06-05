export interface ContentGenerator {
  generate(prompt: string): Promise<string>;
}

export interface ContentEvaluator {
  evaluate(prompt: string): Promise<string>;
}

export interface TopicGenerator {
  generate(prompt: string): Promise<string>;
}
