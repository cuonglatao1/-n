import { Module } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { GoogleService } from './google/google.service';
import { LlmProvidersService } from './llm-providers.service';
import { LlmProvidersController } from './llm-providers.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OpenaiService, GoogleService, LlmProvidersService],
  controllers: [LlmProvidersController],
  exports: [LlmProvidersService],
})
export class LlmProvidersModule {}
