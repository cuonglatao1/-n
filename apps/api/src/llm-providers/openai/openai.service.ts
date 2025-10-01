import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
@Injectable()
export class OpenaiService {
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

  async generateText(
    apiKey: string,
    prompt: string,
    model?: string
  ): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey,
      });

      const selectedModel = model || 'gpt-4o-mini';

      const result = await openai.responses.create({
        model: selectedModel,
        input: prompt,
      });
      return result.output_text;
    } catch (error) {
      return error.message;
    }
  }

  async *streamText(
    apiKey: string,
    prompt: string,
    model?: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    const openai = new OpenAI({ apiKey });
    const selectedModel = model || 'gpt-4o-mini';

    // Build input as a simple chat array if history present (Responses API expects input_text)
    const input = history && history.length
      ? ([
          ...history.map((m) => ({ role: m.role, content: m.content  })),
        ] as any)
      : (prompt as any);
    console.log(input);
    const stream = await openai.responses.stream({ model: selectedModel, input });

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield event.delta;
      }
      if (event.type === 'response.completed') {
        break;
      }
    }
  }
}
