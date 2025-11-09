import { useInfiniteQuery } from "@tanstack/react-query";
import { jobsApi } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import type { GetAllJobsParams } from "@/types";

export function useJobsInfinite(params?: Omit<GetAllJobsParams, "page">) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.jobs.lists(), "infinite", params] as const,
    queryFn: ({ pageParam = 1 }) =>
      jobsApi.getAllJobs({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.pagination.hasPrevPage
        ? firstPage.pagination.currentPage - 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 30000, // 30 seconds
  });
}
