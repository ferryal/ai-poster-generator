import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { GetAllJobsParams } from "@/types";

export function useJobs(params?: GetAllJobsParams) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobsApi.getAllJobs(params),
    staleTime: 30000, // 30 seconds
  });
}

