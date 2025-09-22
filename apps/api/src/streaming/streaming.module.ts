import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { LlmProvidersModule } from '../llm-providers/llm-providers.module';
import { SettingsModule } from '../settings/settings.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [LlmProvidersModule, SettingsModule, PrismaModule],
  controllers: [StreamingController],
  providers: [StreamingService],
})
export class StreamingModule {}
