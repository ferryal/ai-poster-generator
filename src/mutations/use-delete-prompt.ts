import { useMutation, useQueryClient } from "@tanstack/react-query";

import { promptsApi, queryKeys } from "@/api";

export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promptsApi.deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.stats() });
    },
  });
}

