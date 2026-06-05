export type ContentType = 'blog' | 'sns' | 'faq' | 'docs' | 'announcement';

export type BlogData = {
  title: string;
  summary: string;
  body_markdown: string;
  tags?: string[];
  category?: string;
  seo?: {
    meta_title: string;
    meta_description: string;
  };
};

export type SnsData = {
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  content: string;
  hashtags?: string[];
  source_ref?: string;
};

export type ContentDataMap = {
  blog: BlogData;
  sns: SnsData;
  faq: Record<string, unknown>;
  docs: Record<string, unknown>;
  announcement: Record<string, unknown>;
};

export type Meta = {
  quality_score: number;
  dimensions: {
    readability: number;
    relevance: number;
    tone_match: number;
    originality: number;
  };
  warnings: string[];
};

export type Candidate<T> = {
  data: T;
  meta: Meta;
  scores?: {
    custom?: number;
    [key: string]: number | undefined;
  };
};

export type Envelope<T> = {
  type: ContentType;
  data: T;
  meta: Meta;
};

export type CandidateSelectionResult<T> = {
  type: ContentType;
  candidates: Array<Candidate<T>>;
  defaultWinnerIndex: number;
};

export type GenerateInput = {
  type: ContentType;
  templateId: string;
  context: Record<string, unknown>;
};

export type TransformInput = {
  from: ContentType;
  to: ContentType;
  templateId: string;
  input: unknown;
  context?: Record<string, unknown>;
};
