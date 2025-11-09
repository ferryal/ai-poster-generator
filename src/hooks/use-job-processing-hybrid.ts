import { useState, useEffect } from "react";
import { useJobProcessing } from "./use-job-processing";
import { useJobPolling } from "./use-job-polling";
import type { CopyContent, Design, ProcessedImage } from "@/types";

export interface UseJobProcessingHybridOptions {
  jobId: string;
  onComplete?: (results: {
    copyContent: CopyContent;
    designs: Design[];
    processedImages: ProcessedImage[];
  }) => void;
  onError?: (error: string) => void;
  preferSSE?: boolean;
  sseTimeout?: number;
  pollInterval?: number;
}

const DEFAULT_SSE_TIMEOUT = 5000;
const DEFAULT_POLL_INTERVAL = 4000;

export function useJobProcessingHybrid({
  jobId,
  onComplete,
  onError,
  preferSSE = true,
  sseTimeout = DEFAULT_SSE_TIMEOUT,
  pollInterval = DEFAULT_POLL_INTERVAL,
}: UseJobProcessingHybridOptions) {
  const [useSSE, setUseSSE] = useState(preferSSE);
  const [sseAttempted, setSSEAttempted] = useState(false);

  // SSE hook (only enabled if useSSE is true)
  const sseState = useJobProcessing({
    jobId,
    onComplete,
    onError: (error) => {
      console.log("[HYBRID] SSE error:", error);
    },
    autoReconnect: false,
    maxReconnectAttempts: 0,
  });

  const pollingState = useJobPolling({
    jobId,
    onComplete,
    onError,
    pollInterval,
    enabled: !useSSE,
  });

  // Monitor SSE connection status and fall back to polling if it fails
  useEffect(() => {
    if (!useSSE || sseAttempted) return;

    // Wait for SSE timeout to see if connection succeeds
    const timeout = setTimeout(() => {
      if (!sseState.isConnected && !sseState.isComplete) {
        console.log("[HYBRID] SSE timeout - falling back to polling");
        setUseSSE(false);
        setSSEAttempted(true);
      }
    }, sseTimeout);

    return () => clearTimeout(timeout);
  }, [
    useSSE,
    sseAttempted,
    sseState.isConnected,
    sseState.isComplete,
    sseTimeout,
  ]);

  useEffect(() => {
    if (useSSE && sseState.error && !sseAttempted) {
      console.log("[HYBRID] SSE failed - falling back to polling");
      console.log("[HYBRID] SSE error was:", sseState.error);
      setUseSSE(false);
      setSSEAttempted(true);
    }
  }, [useSSE, sseState.error, sseAttempted]);

  // Return the active state (SSE or polling)
  const activeState = useSSE ? sseState : pollingState;

  return {
    ...activeState,
    mode: useSSE ? "sse" : "polling",
  };
}
