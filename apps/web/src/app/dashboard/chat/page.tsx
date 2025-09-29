"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { toast } from 'sonner';

import CanvasBoard from '@/components/canvas/canvas-board';
import { useCanvas } from '@/hooks/use-canvas';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const flowParam = searchParams.get('flow');
  const createNew = searchParams.get('new') === 'true';
  
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(flowParam);
  const [newFlowName, setNewFlowName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(createNew);
  
  const { 
    flows, 
    isLoadingFlows, 
    createCanvas, 
    saveCanvas, 
    isCreatingFlow,
    useFlow
  } = useCanvas();

  const { data: currentFlow, isLoading: isLoadingFlow } = useFlow(currentFlowId || undefined);

  // Handle flow selection from URL params or auto-select first flow
  useEffect(() => {
    if (createNew) {
      // When creating new, don't auto-select any flow
      setCurrentFlowId(null);
    } else if (flowParam) {
      setCurrentFlowId(flowParam);
    } else if (!isLoadingFlows && flows && flows.length > 0 && !currentFlowId) {
      setCurrentFlowId(flows[0].id);
    }
  }, [flows, isLoadingFlows, currentFlowId, flowParam, createNew]);

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) {
      toast.error('Please enter a flow name');
      return;
    }

    try {
      const newFlow = await createCanvas(newFlowName.trim(), 'Canvas board for visual flow design');
      if (newFlow) {
        setCurrentFlowId(newFlow.id);
        setNewFlowName('');
        setIsCreateDialogOpen(false);
        toast.success('Canvas created successfully');
        
        // Update URL to reflect the new flow
        window.history.replaceState({}, '', `/dashboard/chat?flow=${newFlow.id}`);
      }
    } catch (error) {
      console.error('Failed to create flow:', error);
      toast.error('Failed to create canvas');
    }
  };

  const handleSaveCanvas = async (nodes: Node[], edges: Edge[]) => {
    if (!currentFlowId) {
      toast.error('No canvas selected');
      return;
    }

    await saveCanvas(currentFlowId, nodes, edges);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-2">
        {isLoadingFlow ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading canvas...</div>
          </div>
        ) : currentFlowId && currentFlow ? (
          <CanvasBoard
            currentFlow={currentFlow}
            initialNodes={currentFlow.nodes || []}
            initialEdges={currentFlow.edges || []}
            onSave={handleSaveCanvas}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No Canvas Available</h3>
                <p className="text-muted-foreground">
                  Create a new canvas to start building your visual flow
                </p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Canvas
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Canvas Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter canvas name..."
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFlow()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFlow} disabled={isCreatingFlow || !newFlowName.trim()}>
                {isCreatingFlow ? 'Creating...' : 'Create Canvas'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
