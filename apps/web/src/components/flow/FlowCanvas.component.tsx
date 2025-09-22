"use client"

import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PromptNode } from './PromptNode.component';
import { Button } from '@/components/ui/button';
import { Plus, Save, Play, Square } from 'lucide-react';
import { useFlowStore } from '@/stores/flow.store';
import { useStreaming } from '@/hooks/use-streaming';
import { useToast } from '@/components/ui/use-toast';
import { generateId } from '@canvas-llm/shared';
import type { PromptNode as PromptNodeType } from '@canvas-llm/shared';

const nodeTypes = {
  promptNode: PromptNode,
};

interface FlowCanvasProps {
  flowId?: string;
}

function FlowCanvasInner({ flowId }: FlowCanvasProps) {
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addNode,
    currentFlow,
  } = useFlowStore();

  const { stopAllStreams, activeStreamCount } = useStreaming();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Sync with store
  React.useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  React.useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  React.useEffect(() => {
    setStoreNodes(nodes);
  }, [nodes, setStoreNodes]);

  React.useEffect(() => {
    setStoreEdges(edges);
  }, [edges, setStoreEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = useCallback(() => {
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const newNode: PromptNodeType = {
      id: generateId(),
      type: 'promptNode',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        id: generateId(),
        prompt: '',
        selectedModel: null,
        response: '',
        isLoading: false,
        timestamp: new Date(),
      },
    };

    addNode(newNode);
    toast({
      title: 'Node Added',
      description: 'A new prompt node has been added to the flow.',
    });
  }, [addNode, toast]);

  const onSave = useCallback(async () => {
    if (!currentFlow) {
      toast({
        variant: 'destructive',
        title: 'No Flow',
        description: 'Please create or select a flow first.',
      });
      return;
    }

    try {
      // Here you would call the API to save the flow
      // await apiClient.updateFlow(currentFlow.id, { nodes, edges });
      
      toast({
        title: 'Flow Saved',
        description: 'Your flow has been saved successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Failed to save the flow. Please try again.',
      });
    }
  }, [currentFlow, nodes, edges, toast]);

  const onStopAll = useCallback(() => {
    stopAllStreams();
    toast({
      title: 'All Streams Stopped',
      description: 'All active streams have been stopped.',
    });
  }, [stopAllStreams, toast]);

  const minimapNodeColor = (node: Node) => {
    switch (node.type) {
      case 'promptNode':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        className="bg-background"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={minimapNodeColor}
          className="bg-background border border-border"
        />
        
        <Panel position="top-left" className="flex gap-2">
          <Button onClick={onAddNode} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Node
          </Button>
          
          <Button onClick={onSave} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Flow
          </Button>
          
          {activeStreamCount > 0 && (
            <Button onClick={onStopAll} variant="destructive" size="sm">
              <Square className="h-4 w-4 mr-2" />
              Stop All ({activeStreamCount})
            </Button>
          )}
        </Panel>

        <Panel position="bottom-right" className="text-xs text-muted-foreground">
          <div className="bg-card border border-border rounded-md p-2 space-y-1">
            <div>Nodes: {nodes.length}</div>
            <div>Edges: {edges.length}</div>
            {activeStreamCount > 0 && (
              <div className="text-primary">Active Streams: {activeStreamCount}</div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas({ flowId }: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner flowId={flowId} />
    </ReactFlowProvider>
  );
}
