import { useMutation } from "@tanstack/react-query";

import { jobsApi } from "@/api";

export function useCreateJob() {
  return useMutation({
    mutationFn: () => jobsApi.createJob(),
  });
}


