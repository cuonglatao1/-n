import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createCipher, createDecipher } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LlmProvidersService } from '../llm-providers/llm-providers.service';
import { AddApiKeyDto, UpdateApiKeyDto } from './dto';

@Injectable()
export class SettingsService {
  private readonly encryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private llmProvidersService: LlmProvidersService,
  ) {
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
  }

  async getUserSettings(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    const apiKeys = await this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        name: true,
        keyPreview: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      userId,
      apiKeys,
      preferences: settings || {
        defaultModel: 'gpt-3.5-turbo',
        maxConcurrentRequests: 3,
        autoSaveInterval: 30000,
        theme: 'system',
      },
    };
  }

  async addApiKey(userId: string, addApiKeyDto: AddApiKeyDto) {
    const { provider, name, apiKey } = addApiKeyDto;

    // Validate API key with the provider
    const isValid = await this.llmProvidersService.validateApiKey(provider as Provider, apiKey);
    if (!isValid) {
      throw new BadRequestException('Invalid API key');
    }

    // Encrypt the API key
    const keyHash = this.encryptApiKey(apiKey);
    const keyPreview = `...${apiKey.slice(-4)}`;

    const createdApiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        provider: provider as Provider,
        name,
        keyHash,
        keyPreview,
      },
      select: {
        id: true,
        provider: true,
        name: true,
        keyPreview: true,
        isActive: true,
        createdAt: true,
      },
    });

    return createdApiKey;
  }

  async updateApiKey(userId: string, keyId: string, updateApiKeyDto: UpdateApiKeyDto) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    const updatedApiKey = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: updateApiKeyDto,
      select: {
        id: true,
        provider: true,
        name: true,
        keyPreview: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updatedApiKey;
  }

  async deleteApiKey(userId: string, keyId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });
  }

  async getApiKeyForProvider(userId: string, provider: Provider): Promise<string | null> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        userId,
        provider,
        isActive: true,
      },
    });

    if (!apiKey) {
      return null;
    }

    return this.decryptApiKey(apiKey.keyHash);
  }

  private encryptApiKey(apiKey: string): string {
    const cipher = createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptApiKey(encryptedApiKey: string): string {
    const decipher = createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedApiKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
