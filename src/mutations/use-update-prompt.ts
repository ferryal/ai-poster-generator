import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi, queryKeys } from "@/api";
import type { UpdatePromptRequest } from "@/types";

interface UpdatePromptVariables {
  id: string;
  data: UpdatePromptRequest;
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePromptVariables) =>
      promptsApi.updatePrompt(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.prompts.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.stats() });
    },
  });
}

