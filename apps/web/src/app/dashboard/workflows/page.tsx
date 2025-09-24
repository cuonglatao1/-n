"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Workflow } from 'lucide-react';

export default function WorkflowsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">
              Create and manage your LLM workflows
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/workflows/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Workflow className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-medium">No workflows yet</h3>
                <p className="text-muted-foreground mt-2">
                  Create your first workflow to start building LLM automations with our visual canvas
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/dashboard/workflows/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Workflow
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
