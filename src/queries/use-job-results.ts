import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";

export function useJobResults(jobId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.results(jobId || ""),
    queryFn: () => {
      if (!jobId) {
        throw new Error("Job ID is required");
      }
      return jobsApi.getJobResults(jobId);
    },
    enabled: !!jobId, // only run query if jobId exists
    staleTime: 60000, // 60 seconds
  });
}
