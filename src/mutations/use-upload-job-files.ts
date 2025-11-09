import { useMutation } from "@tanstack/react-query";

import { jobsApi } from "@/api";
import type { UploadJobFilesRequest, UploadJobResponse } from "@/types";

interface UploadJobFilesVariables {
  jobId: string;
  data: UploadJobFilesRequest;
}

export function useUploadJobFiles() {
  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: UploadJobFilesVariables): Promise<UploadJobResponse> =>
      jobsApi.uploadJobFiles(jobId, data),
  });
}
