import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FlowModule } from './flow/flow.module';
import { LlmProvidersModule } from './llm-providers/llm-providers.module';
import { SettingsModule } from './settings/settings.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FlowModule,
    LlmProvidersModule,
    SettingsModule,
  ],
})
export class AppModule {}
