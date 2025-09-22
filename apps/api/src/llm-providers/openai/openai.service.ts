import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { StreamParams } from '../llm-providers.service';

@Injectable()
export class OpenaiService {
  async generateStream(params: StreamParams): Promise<AsyncIterable<string>> {
    const openai = new OpenAI({
      apiKey: params.apiKey,
    });

    const stream = await openai.chat.completions.create({
      model: params.model,
      messages: [
        {
          role: 'user',
          content: params.prompt,
        },
      ],
      stream: true,
      temperature: params.options?.temperature ?? 0.7,
      max_tokens: params.options?.maxTokens ?? 2000,
      top_p: params.options?.topP,
      frequency_penalty: params.options?.frequencyPenalty,
      presence_penalty: params.options?.presencePenalty,
      stop: params.options?.stop,
    });

    return this.createAsyncIterable(stream);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const openai = new OpenAI({
        apiKey,
      });

      await openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async* createAsyncIterable(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
