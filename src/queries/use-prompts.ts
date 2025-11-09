import { useQuery } from "@tanstack/react-query";

import { promptsApi, queryKeys } from "@/api";
import { QUERY_CONFIG } from "@/api/config";
import type { GetPromptsParams } from "@/types";

export function usePrompts(params?: GetPromptsParams) {
  return useQuery({
    queryKey: queryKeys.prompts.list(params),
    queryFn: () => promptsApi.getPrompts(params),
    staleTime: QUERY_CONFIG.STALE_TIME,
    retry: QUERY_CONFIG.RETRY,
  });
}

export function usePrompt(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.prompts.detail(id),
    queryFn: () => promptsApi.getPromptById(id),
    enabled: enabled && !!id,
    staleTime: QUERY_CONFIG.STALE_TIME,
    retry: QUERY_CONFIG.RETRY,
  });
}

export function usePromptStats() {
  return useQuery({
    queryKey: queryKeys.prompts.stats(),
    queryFn: () => promptsApi.getPromptStats(),
    staleTime: QUERY_CONFIG.STALE_TIME,
    retry: QUERY_CONFIG.RETRY,
  });
}

