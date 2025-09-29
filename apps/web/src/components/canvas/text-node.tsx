"use client"

import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextNodeData {
  id: string;
  text: string;
  isEditing?: boolean;
}

export default function TextNode({ data, selected }: NodeProps<TextNodeData>) {
  const [isEditing, setIsEditing] = useState(data.isEditing || false);
  const [text, setText] = useState(data.text || '');

  const handleSave = useCallback(() => {
    // Update the node data
    data.text = text;
    data.isEditing = false;
    setIsEditing(false);
  }, [text, data]);

  const handleCancel = useCallback(() => {
    setText(data.text || '');
    setIsEditing(false);
    data.isEditing = false;
  }, [data]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    data.isEditing = true;
  }, [data]);

  return (
    <Card className={cn(
      "min-w-[200px] max-w-[300px] transition-all duration-200",
      selected && "ring-2 ring-primary ring-offset-2"
    )}>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="min-h-[80px] resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-7 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 px-2"
              >
                <Save className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="min-h-[80px] whitespace-pre-wrap break-words text-sm">
              {text || 'Click to edit...'}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="absolute top-0 right-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
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
