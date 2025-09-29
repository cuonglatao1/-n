"use client"

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  History, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  Copy,
  Calendar,
  FileText,
  Plus,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { useCanvas } from '@/hooks/use-canvas';
import { Flow } from '@canvas-llm/shared';
import { FlowPreview } from '@/components/canvas/flow-preview';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');

  const { 
    flows, 
    isLoadingFlows, 
    deleteFlow, 
    isDeletingFlow,
    createCanvas,
    isCreatingFlow,
    renameFlow,
    isUpdatingFlow,
    duplicateFlow
  } = useCanvas();

  // Filter flows based on search query
  const filteredFlows = flows?.filter(flow => 
    flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteFlow = async () => {
    if (!selectedFlow) return;

    try {
      await deleteFlow(selectedFlow.id);
      toast.success('Canvas deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedFlow(null);
    } catch (error) {
      console.error('Failed to delete flow:', error);
      toast.error('Failed to delete canvas');
    }
  };

  const handleDuplicateFlow = async (flow: Flow) => {
    try {
      const duplicatedFlow = await duplicateFlow(flow);
      
      if (duplicatedFlow) {
        toast.success('Canvas duplicated successfully');
      }
    } catch (error) {
      console.error('Failed to duplicate flow:', error);
      toast.error('Failed to duplicate canvas');
    }
  };

  const getNodeCount = (flow: Flow) => {
    return Array.isArray(flow.nodes) ? flow.nodes.length : 0;
  };

  const getEdgeCount = (flow: Flow) => {
    return Array.isArray(flow.edges) ? flow.edges.length : 0;
  };

  if (isLoadingFlows) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading canvas history...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Canvas History</h1>
                <p className="text-muted-foreground">
                  View and manage all your canvas boards and conversation flows
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {filteredFlows.length} Canvas{filteredFlows.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6 border-b">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search canvas boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Link href="/dashboard/chat?new=true">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Canvas
            </Button>
          </Link>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="flex-1 p-6">
        {filteredFlows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <History className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {searchQuery ? 'No matching canvas boards' : 'No canvas boards yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Create your first canvas to get started'
                  }
                </p>
              </div>
              {!searchQuery && (
                <Link href="/dashboard/chat?new=true">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Canvas
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlows.map((flow) => (
              <Card key={flow.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{flow.name}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {flow.description || 'No description'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/chat?flow=${flow.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Open Canvas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateFlow(flow)}
                          disabled={isCreatingFlow}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFlow(flow);
                            setNewFlowName(flow.name);
                            setIsRenameDialogOpen(true);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFlow(flow);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Flow Preview */}
                    <FlowPreview flow={flow} className="h-20" />

                    {/* Stats */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {getNodeCount(flow)} nodes
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full border-2 border-current" />
                        {getEdgeCount(flow)} connections
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Updated {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                    </div>

                    {/* Action Button */}
                    <Link href={`/dashboard/chat?flow=${flow.id}`} className="block">
                      <Button className="w-full" size="sm">
                        Open Canvas
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete &ldquo;{selectedFlow?.name}&rdquo;? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteFlow}
              disabled={isDeletingFlow}
            >
              {isDeletingFlow ? 'Deleting...' : 'Delete Canvas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Canvas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter new name..."
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameFlow()}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameFlow}
              disabled={!newFlowName.trim() || isUpdatingFlow}
            >
              {isUpdatingFlow ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  async function handleRenameFlow() {
    if (!selectedFlow || !newFlowName.trim()) return;

    try {
      await renameFlow(selectedFlow.id, newFlowName.trim());
      toast.success('Canvas renamed successfully');
      setIsRenameDialogOpen(false);
      setSelectedFlow(null);
      setNewFlowName('');
    } catch (error) {
      console.error('Failed to rename flow:', error);
      toast.error('Failed to rename canvas');
    }
  }
}
