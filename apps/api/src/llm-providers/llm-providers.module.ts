import { Module } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { AnthropicService } from './anthropic/anthropic.service';
import { GoogleService } from './google/google.service';
import { LlmProvidersService } from './llm-providers.service';

@Module({
  providers: [
    OpenaiService,
    AnthropicService,
    GoogleService,
    LlmProvidersService,
  ],
  exports: [LlmProvidersService],
})
export class LlmProvidersModule {}
