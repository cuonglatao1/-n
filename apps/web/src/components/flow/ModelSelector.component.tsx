"use client"

import React, { useMemo } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/stores/settings.store';
import type { LLMModel } from '@canvas-llm/shared';

interface ModelSelectorProps {
  value: LLMModel | null;
  onValueChange: (model: LLMModel | null) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onValueChange, disabled }: ModelSelectorProps) {
  const { getAvailableModels } = useSettingsStore();
  const availableModels = getAvailableModels();

  const modelsByProvider = useMemo(() => {
    const grouped = availableModels.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<string, LLMModel[]>);

    return grouped;
  }, [availableModels]);

  const handleValueChange = (modelId: string) => {
    const selectedModel = availableModels.find(model => model.id === modelId);
    onValueChange(selectedModel || null);
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'OPENAI':
        return 'OpenAI';
      case 'ANTHROPIC':
        return 'Anthropic';
      case 'GOOGLE':
        return 'Google';
      default:
        return provider;
    }
  };

  if (availableModels.length === 0) {
    return (
      <div className="p-3 text-sm text-muted-foreground text-center border border-dashed rounded-md">
        No models available. Please add API keys in settings.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Model</label>
      <Select
        value={value?.id || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model...">
            {value && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getProviderDisplayName(value.provider)}
                </Badge>
                <span>{value.displayName}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {Object.entries(modelsByProvider).map(([provider, models]) => (
            <SelectGroup key={provider}>
              <SelectLabel className="flex items-center gap-2">
                {getProviderDisplayName(provider)}
                <Badge variant="secondary" className="text-xs">
                  {models.length}
                </Badge>
              </SelectLabel>
              
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{model.displayName}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Max: {model.maxTokens.toLocaleString()} tokens</span>
                        {model.pricing && (
                          <span>
                            ${model.pricing.input.toFixed(3)}/K in, ${model.pricing.output.toFixed(3)}/K out
                          </span>
                        )}
                      </div>
                      {model.supportedFeatures.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {model.supportedFeatures.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      
      {value && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Provider: {getProviderDisplayName(value.provider)}</div>
          <div>Max Tokens: {value.maxTokens.toLocaleString()}</div>
          {value.supportedFeatures.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              Features: {value.supportedFeatures.map((feature, index) => (
                <span key={feature}>
                  {feature}{index < value.supportedFeatures.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
