import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
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
    private googleService: GoogleService
  ) {}
  async validateApiKey(provider: Provider, apiKey: string): Promise<boolean> {
    try {
      switch (provider) {
        case 'OPENAI':
          return this.openaiService.validateApiKey(apiKey);
        case 'GOOGLE':
          return this.googleService.validateApiKey(apiKey);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }
}
