"use client"

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, FileText } from 'lucide-react';

import TextNode, { TextNodeData } from './text-node';
import { Flow } from '@canvas-llm/shared';
import { useToast } from '../ui/use-toast';

const nodeTypes: NodeTypes = {
  textNode: TextNode,
};

interface CanvasBoardProps {
  currentFlow?: Flow;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  className?: string;
}

let nodeId = 0;
const getId = () => `text_${nodeId++}`;

export default function CanvasBoard({
  currentFlow,
  initialNodes = [],
  initialEdges = [],
  onSave,
  className,
}: CanvasBoardProps) {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update nodes and edges when initialNodes/initialEdges change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<TextNodeData> = {
        id: getId(),
        type: 'textNode',
        position,
        data: {
          id: getId(),
          text: '',
          isEditing: true,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const addTextNode = useCallback(() => {
    const newNode: Node<TextNodeData> = {
      id: getId(),
      type: 'textNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        id: getId(),
        text: '',
        isEditing: true,
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const handleSave = useCallback(async () => {
    if (!onSave) {
      toast({
        title: 'Save function not provided',
        description: 'Save function not provided',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nodes, edges);
      toast({
        title: 'Canvas Saved',
        description: 'Your canvas has been saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save canvas:', error);
      toast({
        title: 'Failed to save canvas',
        description: 'Failed to save canvas',
      });
    } finally {
      setIsSaving(false);
    }
  }, [onSave, toast, nodes, edges]);

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Toolbar */}
      <Card className="mb-2 flex flex-row items-start justify-between p-2 gap-2">
        <CardHeader className="pb-3 p-0 w-1/2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {currentFlow?.name}
          </CardTitle>
          <span className="text-sm text-muted-foreground">{currentFlow?.description}</span>
        </CardHeader>

        <CardContent className="pt-0 p-0 w-1/2 flex items-start justify-end">
          <div className="flex gap-2">
            <Button onClick={addTextNode} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Text Node
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Canvas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-background">
        <ReactFlowProvider>
          <div className="w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap
                nodeStrokeColor="#374151"
                nodeColor="#f3f4f6"
                nodeBorderRadius={8}
                className="bg-background border"
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                className="opacity-50"
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

// Wrapper component to handle ReactFlow provider
export function CanvasBoardWrapper(props: CanvasBoardProps) {
  return (
    <ReactFlowProvider>
      <CanvasBoard {...props} />
    </ReactFlowProvider>
  );
}
