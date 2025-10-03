"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsStore } from '@/stores/settings.store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface TextNodeData {
  id: string;
  text: string;
  isEditing?: boolean;
  role?: 'user' | 'assistant';
  model?: string;
}

export default function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [text, setText] = useState(data.text || '');
  const [model, setModel] = useState<string>(data.model || 'gpt-4o-mini');
  const hasActiveApiKey = useSettingsStore((s) => s.apiKeys.some((k) => k.isActive));

  // Keep local text in sync with external updates (e.g., assistant response)
  useEffect(() => {
    if (!isEditing) {
      setText(data.text || '');
    }
  }, [data.text, isEditing]);

  const handleSave = useCallback(() => {
    // Update the node data
    data.text = text;
    data.isEditing = false;
    data.model = model;
    setIsEditing(false);
  }, [text, model, data]);

  const handleCancel = useCallback(() => {
    setText(data.text || '');
    setIsEditing(false);
    data.isEditing = false;
  }, [data]);

  const handleEdit = useCallback(() => {
    if (data.role === 'assistant') return; // assistant nodes are read-only
    setIsEditing(true);
    data.isEditing = true;
  }, [data]);

  const handleAskLlm = useCallback(() => {
    const content = (isEditing ? text : (data.text || ''))?.trim();
    if (!content) return;
    const event = new CustomEvent('canvas:ask-llm', {
      detail: { nodeId: id, text: content, model },
    });
    window.dispatchEvent(event);
  }, [id, text, model, data.text, isEditing]);

  return (
    <Card
      className={cn(
        'min-w-[200px] max-w-[300px] transition-all duration-200',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardContent className="p-4">
        {data.role && (
          <div
            className={cn(
              'mb-2 text-xs font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded',
              data.role === 'user' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
            )}
          >
            {data.role === 'user' ? 'User' : 'Assistant'}
          </div>
        )}
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-7 px-2 text-xs">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="o3-mini">o3-mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="min-h-[80px] resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 px-2">
                <X className="h-3 w-3" />
              </Button>
              <Button size="sm" onClick={handleSave} className="h-7 px-2">
                <Save className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="group">
            <div className="min-h-[80px] whitespace-pre-wrap break-words text-sm prose dark:prose-invert max-w-none">
              {(!isEditing ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data.text || ''}
                </ReactMarkdown>
              ) : (
                text || 'Click to edit...'
              )) || 'Click to edit...'}
            </div>
            {data.role !== 'assistant' && (
              <div className="mt-2 flex gap-1 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAskLlm}
                  className="h-6 px-2 text-xs"
                  disabled={!hasActiveApiKey || !((data.text || '').trim())}
                >
                  Ask LLM
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
    </Card>
  );
}
