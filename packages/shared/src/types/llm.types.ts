import { LLMProvider } from './user.types';

export interface LLMModel {
  id: string;
  provider: LLMProvider;
  name: string;
  displayName: string;
  maxTokens: number;
  supportedFeatures: LLMFeature[];
  pricing?: {
    input: number; // per 1K tokens
    output: number; // per 1K tokens
  };
}

export type LLMFeature = 'streaming' | 'vision' | 'tools' | 'json_mode';

export interface StreamRequest {
  nodeId: string;
  prompt: string;
  model: string;
  options?: LLMOptions;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface StreamResponse {
  nodeId: string;
  content: string;
  isComplete: boolean;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    finishReason?: string;
  };
}

export interface LLMProviderService {
  provider: LLMProvider;
  generateStream(params: {
    model: string;
    prompt: string;
    apiKey: string;
    options?: LLMOptions;
  }): AsyncIterable<string>;
  validateApiKey(apiKey: string): Promise<boolean>;
  getModels(): LLMModel[];
}

// Predefined models for each provider
export const OPENAI_MODELS: LLMModel[] = [
  {
    id: 'gpt-4-turbo-preview',
    provider: 'OPENAI',
    name: 'gpt-4-turbo-preview',
    displayName: 'GPT-4 Turbo',
    maxTokens: 128000,
    supportedFeatures: ['streaming', 'vision', 'tools', 'json_mode'],
    pricing: { input: 0.01, output: 0.03 },
  },
  {
    id: 'gpt-4',
    provider: 'OPENAI',
    name: 'gpt-4',
    displayName: 'GPT-4',
    maxTokens: 8192,
    supportedFeatures: ['streaming', 'tools'],
    pricing: { input: 0.03, output: 0.06 },
  },
  {
    id: 'gpt-3.5-turbo',
    provider: 'OPENAI',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    maxTokens: 16384,
    supportedFeatures: ['streaming', 'tools', 'json_mode'],
    pricing: { input: 0.001, output: 0.002 },
  },
];

export const ANTHROPIC_MODELS: LLMModel[] = [
  {
    id: 'claude-3-opus-20240229',
    provider: 'ANTHROPIC',
    name: 'claude-3-opus-20240229',
    displayName: 'Claude 3 Opus',
    maxTokens: 200000,
    supportedFeatures: ['streaming', 'vision'],
    pricing: { input: 0.015, output: 0.075 },
  },
  {
    id: 'claude-3-sonnet-20240229',
    provider: 'ANTHROPIC',
    name: 'claude-3-sonnet-20240229',
    displayName: 'Claude 3 Sonnet',
    maxTokens: 200000,
    supportedFeatures: ['streaming', 'vision'],
    pricing: { input: 0.003, output: 0.015 },
  },
  {
    id: 'claude-3-haiku-20240307',
    provider: 'ANTHROPIC',
    name: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    maxTokens: 200000,
    supportedFeatures: ['streaming', 'vision'],
    pricing: { input: 0.00025, output: 0.00125 },
  },
];

export const GOOGLE_MODELS: LLMModel[] = [
  {
    id: 'gemini-pro',
    provider: 'GOOGLE',
    name: 'gemini-pro',
    displayName: 'Gemini Pro',
    maxTokens: 32768,
    supportedFeatures: ['streaming'],
    pricing: { input: 0.0005, output: 0.0015 },
  },
  {
    id: 'gemini-pro-vision',
    provider: 'GOOGLE',
    name: 'gemini-pro-vision',
    displayName: 'Gemini Pro Vision',
    maxTokens: 16384,
    supportedFeatures: ['streaming', 'vision'],
    pricing: { input: 0.0005, output: 0.0015 },
  },
];

export const ALL_MODELS = [...OPENAI_MODELS, ...ANTHROPIC_MODELS, ...GOOGLE_MODELS];
