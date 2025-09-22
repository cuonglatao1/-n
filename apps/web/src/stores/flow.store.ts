"use client"

import { create } from 'zustand';
import { Edge } from 'reactflow';
import type { PromptNode, Flow } from '@canvas-llm/shared';
import { generateId } from '@canvas-llm/shared';

interface FlowState {
  currentFlow: Flow | null;
  flows: Flow[];
  nodes: PromptNode[];
  edges: Edge[];
  isLoading: boolean;
  error: string | null;
}

interface FlowActions {
  // Flow management
  setCurrentFlow: (flow: Flow | null) => void;
  setFlows: (flows: Flow[]) => void;
  addFlow: (flow: Flow) => void;
  updateFlow: (flowId: string, updates: Partial<Flow>) => void;
  deleteFlow: (flowId: string) => void;
  
  // Node management
  setNodes: (nodes: PromptNode[]) => void;
  addNode: (node: PromptNode) => void;
  updateNode: (nodeId: string, updates: Partial<PromptNode['data']>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Edge management
  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type FlowStore = FlowState & FlowActions;

export const useFlowStore = create<FlowStore>((set, get) => ({
  // State
  currentFlow: null,
  flows: [],
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,

  // Flow management
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  
  setFlows: (flows) => set({ flows }),
  
  addFlow: (flow) =>
    set((state) => ({ flows: [...state.flows, flow] })),
  
  updateFlow: (flowId, updates) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === flowId ? { ...flow, ...updates } : flow
      ),
      currentFlow:
        state.currentFlow?.id === flowId
          ? { ...state.currentFlow, ...updates }
          : state.currentFlow,
    })),
  
  deleteFlow: (flowId) =>
    set((state) => ({
      flows: state.flows.filter((flow) => flow.id !== flowId),
      currentFlow:
        state.currentFlow?.id === flowId ? null : state.currentFlow,
    })),

  // Node management
  setNodes: (nodes) => set({ nodes }),
  
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),
  
  updateNode: (nodeId, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      ),
    })),
  
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    })),
  
  duplicateNode: (nodeId) => {
    const { nodes } = get();
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
    
    if (nodeToDuplicate) {
      const newNode: PromptNode = {
        ...nodeToDuplicate,
        id: generateId(),
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50,
        },
        data: {
          ...nodeToDuplicate.data,
          id: generateId(),
          response: '',
          isLoading: false,
          error: undefined,
          timestamp: new Date(),
        },
      };
      
      set((state) => ({ nodes: [...state.nodes, newNode] }));
    }
  },

  // Edge management
  setEdges: (edges) => set({ edges }),
  
  addEdge: (edge) =>
    set((state) => ({ edges: [...state.edges, edge] })),
  
  deleteEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    })),

  // State management
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}));
