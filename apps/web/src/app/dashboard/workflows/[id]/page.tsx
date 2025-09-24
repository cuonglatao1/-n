"use client"

import React from 'react';
import { FlowCanvas } from '@/components/flow/FlowCanvas.component';

interface WorkflowPageProps {
  params: {
    id: string;
  };
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  return (
    <div className="h-full w-full">
      <FlowCanvas flowId={params.id} />
    </div>
  );
}
