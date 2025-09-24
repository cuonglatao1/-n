"use client"

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';
import { useSettingsStore } from '@/stores/settings.store';
import type { ApiKey, LLMProvider } from '@canvas-llm/shared';

interface AddApiKeyForm {
  provider: LLMProvider | '';
  name: string;
  apiKey: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { apiKeys, setApiKeys, addApiKey: addStoreApiKey, updateApiKey, deleteApiKey } = useSettingsStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [addForm, setAddForm] = useState<AddApiKeyForm>({
    provider: '',
    name: '',
    apiKey: '',
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.getSettings(),
    onSuccess: (response) => {
      if (response.data) {
        setApiKeys(response.data.apiKeys);
      }
    },
  });

  const addApiKeyMutation = useMutation({
    mutationFn: (data: { provider: string; name: string; apiKey: string }) =>
      apiClient.addApiKey(data),
    onSuccess: (response) => {
      if (response.data) {
        addStoreApiKey(response.data);
        setIsAddDialogOpen(false);
        setAddForm({ provider: '', name: '', apiKey: '' });
        toast({
          title: 'API Key Added',
          description: 'Your API key has been added successfully.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add API key',
        description: error.message,
      });
    },
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: ({ keyId, updates }: { keyId: string; updates: Partial<ApiKey> }) =>
      apiClient.updateApiKey(keyId, updates),
    onSuccess: (response, variables) => {
      if (response.data) {
        updateApiKey(variables.keyId, response.data);
        toast({
          title: 'API Key Updated',
          description: 'Your API key has been updated successfully.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update API key',
        description: error.message,
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (keyId: string) => apiClient.deleteApiKey(keyId),
    onSuccess: (_, keyId) => {
      deleteApiKey(keyId);
      toast({
        title: 'API Key Deleted',
        description: 'Your API key has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete API key',
        description: error.message,
      });
    },
  });

  const handleAddApiKey = () => {
    if (!addForm.provider || !addForm.name || !addForm.apiKey) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all fields.',
      });
      return;
    }

    addApiKeyMutation.mutate({
      provider: addForm.provider,
      name: addForm.name,
      apiKey: addForm.apiKey,
    });
  };

  const handleToggleActive = (keyId: string, isActive: boolean) => {
    updateApiKeyMutation.mutate({
      keyId,
      updates: { isActive },
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      deleteApiKeyMutation.mutate(keyId);
    }
  };

  const getProviderDisplayName = (provider: LLMProvider) => {
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

  const getProviderColor = (provider: LLMProvider) => {
    switch (provider) {
      case 'OPENAI':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ANTHROPIC':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'GOOGLE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for different LLM providers
                  </CardDescription>
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add API Key
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add API Key</DialogTitle>
                      <DialogDescription>
                        Add a new API key for an LLM provider
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select
                          value={addForm.provider}
                          onValueChange={(value) => setAddForm({ ...addForm, provider: value as LLMProvider })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPENAI">OpenAI</SelectItem>
                            <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                            <SelectItem value="GOOGLE">Google</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="e.g., My OpenAI Key"
                          value={addForm.name}
                          onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          placeholder="Enter your API key"
                          value={addForm.apiKey}
                          onChange={(e) => setAddForm({ ...addForm, apiKey: e.target.value })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddApiKey}
                        disabled={addApiKeyMutation.isPending}
                      >
                        {addApiKeyMutation.isPending ? 'Adding...' : 'Add Key'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No API keys configured</p>
                  <p className="text-sm">Add an API key to start using LLM models</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getProviderColor(key.provider)}>
                          {getProviderDisplayName(key.provider)}
                        </Badge>
                        
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {key.keyPreview}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${key.id}`} className="text-sm">
                            Active
                          </Label>
                          <Switch
                            id={`active-${key.id}`}
                            checked={key.isActive}
                            onCheckedChange={(checked) => handleToggleActive(key.id, checked)}
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure your default settings and preferences
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Select defaultValue="gpt-3.5-turbo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Concurrent Requests</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Auto Save Interval (seconds)</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
