import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { AnthropicService } from './anthropic/anthropic.service';
import { GoogleService } from './google/google.service';
import { Provider } from '@prisma/client';

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface StreamParams {
  model: string;
  prompt: string;
  apiKey: string;
  options?: LLMOptions;
}

@Injectable()
export class LlmProvidersService {
  constructor(
    private openaiService: OpenaiService,
    private anthropicService: AnthropicService,
    private googleService: GoogleService,
  ) {}

  async generateStream(provider: Provider, params: StreamParams): Promise<AsyncIterable<string>> {
    switch (provider) {
      case 'OPENAI':
        return this.openaiService.generateStream(params);
      case 'ANTHROPIC':
        return this.anthropicService.generateStream(params);
      case 'GOOGLE':
        return this.googleService.generateStream(params);
      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  async validateApiKey(provider: Provider, apiKey: string): Promise<boolean> {
    try {
      switch (provider) {
        case 'OPENAI':
          return this.openaiService.validateApiKey(apiKey);
        case 'ANTHROPIC':
          return this.anthropicService.validateApiKey(apiKey);
        case 'GOOGLE':
          return this.googleService.validateApiKey(apiKey);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  getProviderFromModel(model: string): Provider {
    if (model.startsWith('gpt-')) {
      return 'OPENAI';
    } else if (model.startsWith('claude-')) {
      return 'ANTHROPIC';
    } else if (model.startsWith('gemini-')) {
      return 'GOOGLE';
    } else {
      throw new BadRequestException(`Unknown model: ${model}`);
    }
  }
}
