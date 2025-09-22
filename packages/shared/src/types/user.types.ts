export interface ApiKey {
  id: string;
  provider: LLMProvider;
  name: string;
  keyPreview: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserSettings {
  userId: string;
  apiKeys: ApiKey[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultModel: string;
  maxConcurrentRequests: number;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface AddApiKeyRequest {
  provider: LLMProvider;
  name: string;
  apiKey: string;
}

export interface UpdateApiKeyRequest {
  id: string;
  name?: string;
  isActive?: boolean;
}

export type LLMProvider = 'OPENAI' | 'ANTHROPIC' | 'GOOGLE';
