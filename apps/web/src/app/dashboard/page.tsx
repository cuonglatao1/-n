"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Play,
  Clock,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data - in real app this would come from your API
  const stats = {
    totalExecutions: 0,
    failedExecutions: 0,
    failureRate: 0,
    timeSaved: 0,
    avgRunTime: 0,
  };

  const workflows = [
    {
      id: '1',
      name: 'My workflow',
      lastUpdated: '3 months ago',
      created: '3 June',
      status: 'inactive' as const,
      isPersonal: true,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Overview</h1>
            <p className="text-muted-foreground">
              All the conversation, credentials and executions you have access to
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/workflows/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Conversation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">36</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">36</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedExecutions}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">36</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failureRate}%</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">36</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.timeSaved}s</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">36 (avg.)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRunTime}s</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-auto grid-cols-3">
              <TabsTrigger value="workflows">Conversations</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="executions">Executions</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Search</span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="px-3 py-1 text-sm border rounded-md bg-background"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by last updated</span>
              </div>
            </div>
          </div>

          <TabsContent value="workflows" className="space-y-4">
            {false ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">No conversations yet</h3>
                      <p className="text-muted-foreground">
                        Create your first conversation to get started with LLM automation
                      </p>
                    </div>
                    <Button asChild>
                      <Link href="/dashboard/workflows/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Conversation
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {workflow.status === 'active' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : workflow.status === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{workflow.name}</h3>
                            {workflow.isPersonal && (
                              <Badge variant="secondary" className="text-xs">
                                Personal
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">
                              {workflow.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Last updated {workflow.lastUpdated} | Created {workflow.created}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/workflows/${workflow.id}`}>
                            <Play className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          ⋮
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
                  <div>Total {workflows.length}</div>
                  <div className="flex items-center gap-2">
                    <span>1</span>
                    <span>50/page</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No credentials configured</h3>
                    <p className="text-muted-foreground">
                      Add API keys and credentials to connect to external services
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/dashboard/settings">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Credentials
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="executions" className="space-y-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No executions yet</h3>
                    <p className="text-muted-foreground">
                      Conversations will appear here once you start chatting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
