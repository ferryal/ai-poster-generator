import { useState, useEffect, useCallback, useRef } from "react";
import { API_CONFIG } from "@/api/config";
import type {
  SSEEvent,
  ProcessingStep,
  CopyContent,
  Design,
  ProcessedImage,
  JobStatus,
} from "@/types";

export interface JobProcessingState {
  status: JobStatus;
  currentStep: ProcessingStep | null;
  completedSteps: ProcessingStep[];
  progress: number;
  transcription: string | null;
  copyContent: CopyContent | null;
  designs: Design[];
  processedImages: ProcessedImage[];
  error: string | null;
  isConnected: boolean;
  isComplete: boolean;
}

export interface UseJobProcessingOptions {
  jobId: string;
  onComplete?: (results: {
    copyContent: CopyContent;
    designs: Design[];
    processedImages: ProcessedImage[];
  }) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

const TOTAL_STEPS = 8;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 3;
const DEFAULT_RECONNECT_DELAY = 2000;

/**
 * Custom hook for handling Server-Sent Events (SSE) job processing
 * Provides real-time updates on job processing status with automatic reconnection
 */
export function useJobProcessing({
  jobId,
  onComplete,
  onError,
  autoReconnect = true,
  maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  reconnectDelay = DEFAULT_RECONNECT_DELAY,
}: UseJobProcessingOptions) {
  const [state, setState] = useState<JobProcessingState>({
    status: "processing",
    currentStep: null,
    completedSteps: [],
    progress: 0,
    transcription: null,
    copyContent: null,
    designs: [],
    processedImages: [],
    error: null,
    isConnected: false,
    isComplete: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // Calculate progress based on completed steps
  const calculateProgress = useCallback(
    (completedSteps: ProcessingStep[]): number => {
      return Math.round((completedSteps.length / TOTAL_STEPS) * 100);
    },
    []
  );

  // Handle SSE events
  const handleSSEEvent = useCallback(
    (event: MessageEvent) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            setState((prev) => ({
              ...prev,
              isConnected: true,
              status: "processing",
            }));
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
            break;

          case "step_start":
            setState((prev) => ({
              ...prev,
              currentStep: data.step,
            }));
            break;

          case "step_complete":
            setState((prev) => {
              const newCompletedSteps = [...prev.completedSteps, data.step];
              const newProgress = calculateProgress(newCompletedSteps);

              // Extract results from step completion
              const updates: Partial<JobProcessingState> = {
                completedSteps: newCompletedSteps,
                progress: newProgress,
              };

              // Handle transcription result
              if (data.step === "transcription" && data.result?.text) {
                updates.transcription = data.result.text;
              }

              // Handle copy generation result
              if (data.step === "copy_generation" && data.result) {
                updates.copyContent = data.result;
              }

              // Handle processed images
              if (data.result?.url) {
                const imageTypeMap: Record<
                  ProcessingStep,
                  ProcessedImage["type"] | null
                > = {
                  transcription: null,
                  copy_generation: null,
                  photoshoot_transform: "photoshoot",
                  sharp_expansion: "sharp_expanded",
                  image_blending: "blended",
                  upscaling: "upscaled",
                  html_generation: null,
                  html_to_image: null,
                };

                const imageType = imageTypeMap[data.step];

                if (imageType) {
                  updates.processedImages = [
                    ...prev.processedImages,
                    {
                      type: imageType,
                      url: data.result.url,
                      key: data.result.key || "",
                    },
                  ];
                }
              }

              return { ...prev, ...updates };
            });
            break;

          case "design_generated":
            setState((prev) => ({
              ...prev,
              designs: [
                ...prev.designs.filter(
                  (d) => d.variantNumber !== data.variantNumber
                ),
                data.result,
              ].sort((a, b) => a.variantNumber - b.variantNumber),
            }));
            break;

          case "image_generated":
            setState((prev) => ({
              ...prev,
              designs: prev.designs.map((design) =>
                design.variantNumber === data.variantNumber
                  ? {
                      ...design,
                      imageUrl: data.result.imageUrl,
                      dimensions: data.result.dimensions,
                    }
                  : design
              ),
            }));
            break;

          case "pipeline_complete":
            setState((prev) => ({
              ...prev,
              status: "completed",
              isComplete: true,
              progress: 100,
              copyContent: data.results.copyContent,
              designs: data.results.designs,
              processedImages: data.results.processedImages,
            }));

            // Call completion callback
            if (onCompleteRef.current) {
              onCompleteRef.current(data.results);
            }

            // Close connection after completion
            if (eventSourceRef.current) {
              isManualCloseRef.current = true;
              eventSourceRef.current.close();
            }
            break;

          case "pipeline_error":
            setState((prev) => ({
              ...prev,
              status: "failed",
              error: data.error,
              isConnected: false,
            }));

            // Call error callback
            if (onErrorRef.current) {
              onErrorRef.current(data.error);
            }

            // Close connection on error
            if (eventSourceRef.current) {
              isManualCloseRef.current = true;
              eventSourceRef.current.close();
            }
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE event:", error);
      }
    },
    [calculateProgress]
  );

  // Connect to SSE - defined before handleSSEError to avoid circular dependency
  const connectToSSE = useCallback(() => {
    const url = `${API_CONFIG.BASE_URL}/jobs/${jobId}/process`;

    console.log("[SSE] Connecting to:", url);

    try {
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log("[SSE] Connection opened");
        setState((prev) => ({
          ...prev,
          isConnected: true,
        }));
      };

      eventSource.onmessage = (event) => {
        console.log("[SSE] Message received:", event.data);
        handleSSEEvent(event);
      };

      eventSource.onerror = (error) => {
        console.error("[SSE] Connection error:", error);
        console.error("[SSE] EventSource readyState:", eventSource.readyState);

        // ReadyState values: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("[SSE] Connection closed by server");
        }

        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));

        // Close the current connection
        eventSource.close();

        // Don't attempt reconnection if manually closed or max attempts reached
        if (
          isManualCloseRef.current ||
          !autoReconnect ||
          reconnectAttemptsRef.current >= maxReconnectAttempts
        ) {
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            const errorMessage = `Failed to connect after ${maxReconnectAttempts} attempts`;
            console.error("[SSE]", errorMessage);
            setState((prev) => ({
              ...prev,
              status: "failed",
              error: errorMessage,
            }));

            if (onErrorRef.current) {
              onErrorRef.current(errorMessage);
            }
          }
          return;
        }

        // Attempt reconnection
        reconnectAttemptsRef.current += 1;
        console.log(
          `[SSE] Reconnecting... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          connectToSSE();
        }, reconnectDelay);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("[SSE] Error creating EventSource:", error);
      setState((prev) => ({
        ...prev,
        status: "failed",
        error: "Failed to establish SSE connection",
      }));

      if (onErrorRef.current) {
        onErrorRef.current("Failed to establish SSE connection");
      }
    }
  }, [
    jobId,
    handleSSEEvent,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
  ]);

  // Stop SSE connection - stable function
  const stopProcessing = useCallback(() => {
    isManualCloseRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
    }));
  }, []);

  // Auto-start SSE connection when jobId changes
  useEffect(() => {
    isManualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    connectToSSE();

    // Cleanup on unmount or when jobId changes
    return () => {
      isManualCloseRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connectToSSE]);

  return {
    ...state,
    stopProcessing,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}
