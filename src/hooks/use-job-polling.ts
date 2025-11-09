import { useState, useEffect, useCallback, useRef } from "react";
import { jobsApi } from "@/api/endpoints";
import type {
  ProcessingStep,
  CopyContent,
  Design,
  ProcessedImage,
  JobStatus,
  GetProcessingStatusResponse,
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

export interface UseJobPollingOptions {
  jobId: string;
  onComplete?: (results: {
    copyContent: CopyContent;
    designs: Design[];
    processedImages: ProcessedImage[];
  }) => void;
  onError?: (error: string) => void;
  pollInterval?: number; // milliseconds
  enabled?: boolean;
}

const DEFAULT_POLL_INTERVAL = 4000; // 4 seconds

export function useJobPolling({
  jobId,
  onComplete,
  onError,
  pollInterval = DEFAULT_POLL_INTERVAL,
  enabled = true,
}: UseJobPollingOptions) {
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const isFirstPollRef = useRef(true);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // Calculate progress based on completed steps
  const calculateProgress = useCallback(
    (completed: number, total: number): number => {
      return Math.round((completed / total) * 100);
    },
    []
  );

  // Poll for status
  const pollStatus = useCallback(async () => {
    if (!enabled) return;

    try {
      console.log("[POLLING] Fetching status for job:", jobId);

      const response: GetProcessingStatusResponse =
        await jobsApi.getProcessingStatus(jobId);

      console.log("[POLLING] Status received:", response.status);
      console.log("[POLLING] Progress:", response.progress);
      console.log("[POLLING] Current step:", response.currentStep);

      if (isFirstPollRef.current) {
        isFirstPollRef.current = false;
        console.log("[POLLING] Connected successfully");
      }

      // Calculate progress
      const progress = response.progress
        ? calculateProgress(
            response.progress.completed,
            response.progress.total
          )
        : 0;

      // Update state with polling results
      setState((prev) => ({
        ...prev,
        status: response.status,
        currentStep: response.currentStep || null,
        completedSteps: response.completedSteps || [],
        progress,
        transcription:
          response.partialResults?.transcription || prev.transcription,
        copyContent: response.partialResults?.copyContent || prev.copyContent,
        designs: response.partialResults?.designs || prev.designs,
        processedImages:
          response.partialResults?.processedImages || prev.processedImages,
        isConnected: true,
        error: null,
      }));

      if (response.status === "completed") {
        console.log("[POLLING] Job completed!");

        // Fetch final results
        try {
          const resultsResponse = await jobsApi.getJobResults(jobId);

          setState((prev) => ({
            ...prev,
            status: "completed",
            isComplete: true,
            progress: 100,
            copyContent: resultsResponse.results.copyContent,
            designs: resultsResponse.results.designs,
            processedImages: resultsResponse.results.processedImages,
          }));

          if (onCompleteRef.current) {
            onCompleteRef.current(resultsResponse.results);
          }

          // Stop polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } catch (error) {
          console.error("[POLLING] Error fetching results:", error);
        }
      }

      // Handle failure
      if (response.status === "failed") {
        const errorMessage = "Job processing failed";
        console.error("[POLLING]", errorMessage);

        setState((prev) => ({
          ...prev,
          status: "failed",
          error: errorMessage,
        }));

        if (onErrorRef.current) {
          onErrorRef.current(errorMessage);
        }

        // Stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error: any) {
      console.error("[POLLING] Error:", error);

      if (!isFirstPollRef.current) {
        const errorMessage =
          error.response?.data?.error || "Failed to fetch job status";

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isConnected: false,
        }));

        if (onErrorRef.current) {
          onErrorRef.current(errorMessage);
        }
      }
    }
  }, [jobId, enabled, calculateProgress]);

  // Start polling
  const startPolling = useCallback(() => {
    console.log(
      "[POLLING] Starting polling with interval:",
      pollInterval,
      "ms"
    );

    // Do first poll immediately
    pollStatus();

    intervalRef.current = setInterval(pollStatus, pollInterval);
  }, [pollStatus, pollInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    console.log("[POLLING] Stopping polling");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
    }));
  }, []);

  // Auto-start polling when enabled
  useEffect(() => {
    if (enabled) {
      startPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, startPolling]);

  return {
    ...state,
    stopPolling,
  };
}
