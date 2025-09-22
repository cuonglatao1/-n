import { Node, Edge } from 'reactflow';
import { LLMModel } from './llm.types';

export interface PromptNodeData {
  id: string;
  prompt: string;
  selectedModel: LLMModel | null;
  response: string;
  isLoading: boolean;
  error?: string;
  timestamp: Date;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

export interface PromptNode extends Node {
  type: 'promptNode';
  data: PromptNodeData;
}

export interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: PromptNode[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
}

export interface UpdateFlowRequest {
  id: string;
  name?: string;
  description?: string;
  nodes?: PromptNode[];
  edges?: Edge[];
}

export interface FlowExecutionResult {
  nodeId: string;
  success: boolean;
  response?: string;
  error?: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}
