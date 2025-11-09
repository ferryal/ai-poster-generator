import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi, queryKeys } from "@/api";
import type { CreatePromptRequest } from "@/types";

export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptRequest) => promptsApi.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.stats() });
    },
  });
}

