import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { StreamParams } from '../llm-providers.service';

@Injectable()
export class AnthropicService {
  async generateStream(params: StreamParams): Promise<AsyncIterable<string>> {
    const anthropic = new Anthropic({
      apiKey: params.apiKey,
    });

    const stream = anthropic.messages.stream({
      model: params.model,
      max_tokens: params.options?.maxTokens ?? 2000,
      temperature: params.options?.temperature ?? 0.7,
      messages: [
        {
          role: 'user',
          content: params.prompt,
        },
      ],
    });

    return this.createAsyncIterable(stream);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const anthropic = new Anthropic({
        apiKey,
      });

      // Try to create a minimal request to validate the key
      await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private async* createAsyncIterable(stream: any): AsyncIterable<string> {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
