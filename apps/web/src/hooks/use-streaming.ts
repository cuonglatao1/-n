"use client"

import React, { useCallback, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useFlowStore } from '@/stores/flow.store';
import { useToast } from '@/components/ui/use-toast';
import type { StreamRequest, StreamResponse } from '@canvas-llm/shared';

interface UseStreamingOptions {
  onStart?: (nodeId: string) => void;
  onChunk?: (nodeId: string, chunk: string) => void;
  onComplete?: (nodeId: string, response: string) => void;
  onError?: (nodeId: string, error: string) => void;
}

export function useStreaming(options: UseStreamingOptions = {}) {
  const { toast } = useToast();
  const { updateNode } = useFlowStore();
  const [activeStreams, setActiveStreams] = useState<Map<string, EventSource>>(new Map());
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  const startStream = useCallback(
    async (streamRequest: StreamRequest) => {
      const { nodeId } = streamRequest;

      // Cancel existing stream for this node
      if (eventSourcesRef.current.has(nodeId)) {
        eventSourcesRef.current.get(nodeId)?.close();
        eventSourcesRef.current.delete(nodeId);
      }

      // Update node to loading state
      updateNode(nodeId, {
        isLoading: true,
        error: undefined,
        response: '',
      });

      options.onStart?.(nodeId);

      try {
        const eventSource = apiClient.createStreamingRequest(streamRequest);
        eventSourcesRef.current.set(nodeId, eventSource);
        setActiveStreams(new Map(eventSourcesRef.current));

        let accumulatedResponse = '';

        eventSource.onmessage = (event) => {
          try {
            const data: StreamResponse = JSON.parse(event.data);

            if (data.nodeId === nodeId) {
              if (data.error) {
                updateNode(nodeId, {
                  isLoading: false,
                  error: data.error,
                });
                options.onError?.(nodeId, data.error);
                toast({
                  variant: 'destructive',
                  title: 'Streaming Error',
                  description: data.error,
                });
                return;
              }

              accumulatedResponse += data.content;
              updateNode(nodeId, {
                response: accumulatedResponse,
              });
              
              options.onChunk?.(nodeId, data.content);

              if (data.isComplete) {
                updateNode(nodeId, {
                  isLoading: false,
                  tokenUsage: data.metadata?.tokensUsed ? {
                    input: 0, // Will be calculated on backend
                    output: data.metadata.tokensUsed,
                    total: data.metadata.tokensUsed,
                  } : undefined,
                });
                
                options.onComplete?.(nodeId, accumulatedResponse);
                eventSource.close();
                eventSourcesRef.current.delete(nodeId);
                setActiveStreams(new Map(eventSourcesRef.current));
              }
            }
          } catch (error) {
            console.error('Error parsing stream data:', error);
            updateNode(nodeId, {
              isLoading: false,
              error: 'Failed to parse response',
            });
            options.onError?.(nodeId, 'Failed to parse response');
          }
        };

        eventSource.onerror = (event) => {
          console.error('EventSource error:', event);
          updateNode(nodeId, {
            isLoading: false,
            error: 'Connection error',
          });
          options.onError?.(nodeId, 'Connection error');
          toast({
            variant: 'destructive',
            title: 'Connection Error',
            description: 'Lost connection to the server. Please try again.',
          });
          eventSource.close();
          eventSourcesRef.current.delete(nodeId);
          setActiveStreams(new Map(eventSourcesRef.current));
        };

      } catch (error) {
        console.error('Failed to start stream:', error);
        updateNode(nodeId, {
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        options.onError?.(nodeId, error instanceof Error ? error.message : 'Unknown error');
        toast({
          variant: 'destructive',
          title: 'Stream Error',
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [updateNode, options, toast]
  );

  const stopStream = useCallback((nodeId: string) => {
    const eventSource = eventSourcesRef.current.get(nodeId);
    if (eventSource) {
      eventSource.close();
      eventSourcesRef.current.delete(nodeId);
      setActiveStreams(new Map(eventSourcesRef.current));
      
      updateNode(nodeId, {
        isLoading: false,
      });
    }
  }, [updateNode]);

  const stopAllStreams = useCallback(() => {
    eventSourcesRef.current.forEach((eventSource, nodeId) => {
      eventSource.close();
      updateNode(nodeId, {
        isLoading: false,
      });
    });
    eventSourcesRef.current.clear();
    setActiveStreams(new Map());
  }, [updateNode]);

  const isStreaming = useCallback((nodeId: string) => {
    return eventSourcesRef.current.has(nodeId);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, [stopAllStreams]);

  return {
    startStream,
    stopStream,
    stopAllStreams,
    isStreaming,
    activeStreams: Array.from(activeStreams.keys()),
    activeStreamCount: activeStreams.size,
  };
}
