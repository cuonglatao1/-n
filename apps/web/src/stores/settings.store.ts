"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiKey, UserPreferences, LLMModel } from '@canvas-llm/shared';
import { ALL_MODELS } from '@canvas-llm/shared';

interface SettingsState {
  apiKeys: ApiKey[];
  preferences: UserPreferences;
  availableModels: LLMModel[];
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  // API Keys
  setApiKeys: (apiKeys: ApiKey[]) => void;
  addApiKey: (apiKey: ApiKey) => void;
  updateApiKey: (keyId: string, updates: Partial<ApiKey>) => void;
  deleteApiKey: (keyId: string) => void;
  
  // Preferences
  setPreferences: (preferences: UserPreferences) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  
  // Models
  setAvailableModels: (models: LLMModel[]) => void;
  getAvailableModels: () => LLMModel[];
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultPreferences: UserPreferences = {
  defaultModel: 'gpt-3.5-turbo',
  maxConcurrentRequests: 3,
  autoSaveInterval: 30000, // 30 seconds
  theme: 'system',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // State
      apiKeys: [],
      preferences: defaultPreferences,
      availableModels: ALL_MODELS,
      isLoading: false,
      error: null,

      // API Keys
      setApiKeys: (apiKeys) => set({ apiKeys }),
      
      addApiKey: (apiKey) =>
        set((state) => ({ apiKeys: [...state.apiKeys, apiKey] })),
      
      updateApiKey: (keyId, updates) =>
        set((state) => ({
          apiKeys: state.apiKeys.map((key) =>
            key.id === keyId ? { ...key, ...updates } : key
          ),
        })),
      
      deleteApiKey: (keyId) =>
        set((state) => ({
          apiKeys: state.apiKeys.filter((key) => key.id !== keyId),
        })),

      // Preferences
      setPreferences: (preferences) => set({ preferences }),
      
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      // Models
      setAvailableModels: (models) => set({ availableModels: models }),
      
      getAvailableModels: () => {
        const { apiKeys, availableModels } = get();
        const activeProviders = new Set(
          apiKeys.filter((key) => key.isActive).map((key) => key.provider)
        );
        
        return availableModels.filter((model) =>
          activeProviders.has(model.provider)
        );
      },

      // State management
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        preferences: state.preferences,
      }),
    }
  )
);
