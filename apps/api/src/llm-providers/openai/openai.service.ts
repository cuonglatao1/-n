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
}
