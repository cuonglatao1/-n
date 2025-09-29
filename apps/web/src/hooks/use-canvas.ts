"use client"

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Node, Edge } from 'reactflow';
import { apiClient } from '@/lib/api';
import { Flow, CreateFlowRequest } from '@canvas-llm/shared';

export function useCanvas() {
  const queryClient = useQueryClient();

  // Fetch all flows
  const {
    data: flows,
    isLoading: isLoadingFlows,
    error: flowsError
  } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const response = await apiClient.getFlows();
      return response.data;
    },
  });

  // Fetch single flow
  const useFlow = (flowId: string | undefined) => {
    return useQuery({
      queryKey: ['flow', flowId],
      queryFn: async () => {
        if (!flowId) return null;
        const response = await apiClient.getFlow(flowId);
        return response.data;
      },
      enabled: !!flowId,
    });
  };

  // Create flow mutation
  const createFlowMutation = useMutation({
    mutationFn: async (data: CreateFlowRequest) => {
      const response = await apiClient.createFlow(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  // Update flow mutation
  const updateFlowMutation = useMutation({
    mutationFn: async ({ flowId, nodes, edges }: { flowId: string; nodes: any[]; edges: any[] }) => {
      const response = await apiClient.updateFlow(flowId, { nodes, edges });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      queryClient.invalidateQueries({ queryKey: ['flow', variables.flowId] });
    },
  });

  // Delete flow mutation
  const deleteFlowMutation = useMutation({
    mutationFn: async (flowId: string) => {
      await apiClient.deleteFlow(flowId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  // Save canvas function
  const saveCanvas = useCallback(async (
    flowId: string,
    nodes: Node[],
    edges: Edge[]
  ) => {
    return updateFlowMutation.mutateAsync({
      flowId,
      nodes: nodes as any[],
      edges: edges as any[],
    });
  }, [updateFlowMutation]);

  // Create new canvas function
  const createCanvas = useCallback(async (
    name: string,
    description?: string
  ) => {
    return createFlowMutation.mutateAsync({
      name,
      description,
    });
  }, [createFlowMutation]);

  // Rename flow function
  const renameFlow = useCallback(async (
    flowId: string,
    name: string
  ) => {
    const response = await apiClient.updateFlow(flowId, { name });
    queryClient.invalidateQueries({ queryKey: ['flows'] });
    queryClient.invalidateQueries({ queryKey: ['flow', flowId] });
    return response.data;
  }, [queryClient]);

  // Duplicate flow function
  const duplicateFlow = useCallback(async (flow: Flow) => {
    const newFlow = await createFlowMutation.mutateAsync({
      name: `${flow.name} (Copy)`,
      description: flow.description,
    });
    
    // Update the new flow with the copied nodes and edges
    if (newFlow && (flow.nodes.length > 0 || flow.edges.length > 0)) {
      await updateFlowMutation.mutateAsync({
        flowId: newFlow.id,
        nodes: flow.nodes as any[],
        edges: flow.edges as any[],
      });
    }
    
    return newFlow;
  }, [createFlowMutation, updateFlowMutation]);

  return {
    // Data
    flows,
    isLoadingFlows,
    flowsError,
    useFlow,

    // Mutations
    createCanvas,
    saveCanvas,
    renameFlow,
    duplicateFlow,
    deleteFlow: deleteFlowMutation.mutateAsync,
    
    // Loading states
    isCreatingFlow: createFlowMutation.isPending,
    isUpdatingFlow: updateFlowMutation.isPending,
    isDeletingFlow: deleteFlowMutation.isPending,
  };
}
