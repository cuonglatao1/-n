import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamParams } from '../llm-providers.service';

@Injectable()
export class GoogleService {
  async generateStream(params: StreamParams): Promise<AsyncIterable<string>> {
    const genAI = new GoogleGenerativeAI(params.apiKey);
    const model = genAI.getGenerativeModel({ model: params.model });

    const generationConfig = {
      temperature: params.options?.temperature ?? 0.7,
      topP: params.options?.topP ?? 1,
      maxOutputTokens: params.options?.maxTokens ?? 2000,
    };

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      generationConfig,
    });

    return this.createAsyncIterable(result.stream);
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Try to generate a minimal response to validate the key
      await model.generateContent('Hi');
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private async* createAsyncIterable(stream: AsyncIterable<any>): AsyncIterable<string> {
    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }
}
