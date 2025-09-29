import { Node, Edge } from 'reactflow';

export interface TextNodeData {
  id: string;
  text: string;
  isEditing?: boolean;
  // role indicates who authored the message in a conversation canvas
  // when omitted, nodes behave as generic text nodes for backward compatibility
  role?: 'user' | 'assistant';
}

export interface TextNode extends Node {
  type: 'textNode';
  data: TextNodeData;
}

export type FlowNode = TextNode;

export interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
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
  nodes?: FlowNode[];
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
