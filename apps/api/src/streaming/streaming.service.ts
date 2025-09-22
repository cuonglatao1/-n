import { Injectable, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LlmProvidersService } from '../llm-providers/llm-providers.service';
import { SettingsService } from '../settings/settings.service';
import { StreamRequestDto } from './dto';

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

@Injectable()
export class StreamingService {
  constructor(
    private llmProvidersService: LlmProvidersService,
    private settingsService: SettingsService,
  ) {}

  async createStreamObservable(
    userId: string,
    streamRequest: StreamRequestDto,
  ): Promise<Observable<{ data: string }>> {
    const { nodeId, prompt, model, options } = streamRequest;

    // Get provider from model
    const provider = this.llmProvidersService.getProviderFromModel(model);

    // Get user's API key for this provider
    const apiKey = await this.settingsService.getApiKeyForProvider(userId, provider);
    if (!apiKey) {
      throw new BadRequestException(`No API key found for provider: ${provider}`);
    }

    return new Observable((observer) => {
      (async () => {
        try {
          const stream = await this.llmProvidersService.generateStream(provider, {
            model,
            prompt,
            apiKey,
            options,
          });

          let accumulatedContent = '';

          for await (const chunk of stream) {
            accumulatedContent += chunk;
            
            const response: StreamResponse = {
              nodeId,
              content: chunk,
              isComplete: false,
            };

            observer.next({ data: JSON.stringify(response) });
          }

          // Send completion message
          const finalResponse: StreamResponse = {
            nodeId,
            content: '',
            isComplete: true,
            metadata: {
              model,
              tokensUsed: this.estimateTokens(accumulatedContent),
            },
          };

          observer.next({ data: JSON.stringify(finalResponse) });
          observer.complete();
        } catch (error) {
          const errorResponse: StreamResponse = {
            nodeId,
            content: '',
            isComplete: true,
            error: error.message || 'An error occurred during streaming',
          };

          observer.next({ data: JSON.stringify(errorResponse) });
          observer.complete();
        }
      })();
    });
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
}
