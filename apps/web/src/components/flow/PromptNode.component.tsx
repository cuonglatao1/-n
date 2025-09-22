"use client"

import React, { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Copy, Play, Square, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModelSelector } from './ModelSelector.component';
import { useFlowStore } from '@/stores/flow.store';
import { useStreaming } from '@/hooks/use-streaming';
import { useToast } from '@/components/ui/use-toast';
import type { PromptNode as PromptNodeType } from '@canvas-llm/shared';

interface PromptNodeProps extends NodeProps {
  data: PromptNodeType['data'];
}

export const PromptNode = memo(({ id, data, selected }: PromptNodeProps) => {
  const { toast } = useToast();
  const { updateNode, deleteNode, duplicateNode } = useFlowStore();
  const { startStream, stopStream, isStreaming } = useStreaming();
  const [isEditing, setIsEditing] = useState(false);

  const handlePromptChange = useCallback((value: string) => {
    updateNode(id, { prompt: value });
  }, [id, updateNode]);

  const handleModelChange = useCallback((model: any) => {
    updateNode(id, { selectedModel: model });
  }, [id, updateNode]);

  const handleExecute = useCallback(async () => {
    if (!data.selectedModel) {
      toast({
        variant: 'destructive',
        title: 'No Model Selected',
        description: 'Please select a model before executing.',
      });
      return;
    }

    if (!data.prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Prompt',
        description: 'Please enter a prompt before executing.',
      });
      return;
    }

    await startStream({
      nodeId: id,
      prompt: data.prompt,
      model: data.selectedModel.name,
      options: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    });
  }, [id, data.selectedModel, data.prompt, startStream, toast]);

  const handleStop = useCallback(() => {
    stopStream(id);
  }, [id, stopStream]);

  const handleDuplicate = useCallback(() => {
    duplicateNode(id);
    toast({
      title: 'Node Duplicated',
      description: 'A copy of this node has been created.',
    });
  }, [id, duplicateNode, toast]);

  const handleDelete = useCallback(() => {
    deleteNode(id);
    toast({
      title: 'Node Deleted',
      description: 'The node has been removed from the flow.',
    });
  }, [id, deleteNode, toast]);

  const isCurrentlyStreaming = isStreaming(id);

  return (
    <Card className={`w-96 ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Prompt Node
            </Badge>
            {data.selectedModel && (
              <Badge variant="outline" className="text-xs">
                {data.selectedModel.displayName}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExecute}
              disabled={isCurrentlyStreaming || !data.selectedModel}
              className="h-7 w-7 p-0"
            >
              {isCurrentlyStreaming ? (
                <Square className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDuplicate}
              className="h-7 w-7 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 w-7 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {isEditing && (
          <ModelSelector
            value={data.selectedModel}
            onValueChange={handleModelChange}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            value={data.prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
            className="resize-none"
          />
        </div>

        {data.response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Response</label>
              {data.isLoading && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Streaming...</span>
                </div>
              )}
            </div>
            
            <div className="bg-muted/50 rounded-md p-3 text-sm max-h-40 overflow-y-auto">
              {data.response || (data.isLoading ? 'Generating response...' : 'No response yet')}
            </div>
            
            {data.tokenUsage && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Tokens: {data.tokenUsage.total}</span>
                {data.selectedModel?.pricing && (
                  <span>
                    Cost: ${(
                      (data.tokenUsage.input * data.selectedModel.pricing.input / 1000) +
                      (data.tokenUsage.output * data.selectedModel.pricing.output / 1000)
                    ).toFixed(4)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {data.error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
            {data.error}
          </div>
        )}
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});

PromptNode.displayName = 'PromptNode';
