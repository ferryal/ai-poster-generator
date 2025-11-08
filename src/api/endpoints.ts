import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type {
  GetPromptsResponse,
  GetPromptResponse,
  GetPromptStatsResponse,
  CreatePromptResponse,
  UpdatePromptResponse,
  DeletePromptResponse,
  GetPromptsParams,
  CreatePromptRequest,
  UpdatePromptRequest,
  CreateJobResponse,
  UploadJobFilesRequest,
  UploadJobResponse,
  GetJobStatusResponse,
  GetJobResultsResponse,
  GetProcessingStatusResponse,
  DownloadPosterResponse,
  GetAllJobsParams,
  GetAllJobsResponse,
} from "@/types";

// prompts API endpoints
export const promptsApi = {
  // Get all prompts
  getPrompts: async (
    params?: GetPromptsParams
  ): Promise<GetPromptsResponse> => {
    const response = await apiClient.get<GetPromptsResponse>("/prompts", {
      params,
    });
    return response.data;
  },

  // get prompt statistics
  getPromptStats: async (): Promise<GetPromptStatsResponse> => {
    const response = await apiClient.get<GetPromptStatsResponse>(
      "/prompts/stats"
    );
    return response.data;
  },

  // get specific prompt by ID
  getPromptById: async (id: string): Promise<GetPromptResponse> => {
    const response = await apiClient.get<GetPromptResponse>(`/prompts/${id}`);
    return response.data;
  },

  // create new prompt
  createPrompt: async (
    data: CreatePromptRequest
  ): Promise<CreatePromptResponse> => {
    const response = await apiClient.post<CreatePromptResponse>(
      "/prompts",
      data
    );
    return response.data;
  },

  // update existing prompt
  updatePrompt: async (
    id: string,
    data: UpdatePromptRequest
  ): Promise<UpdatePromptResponse> => {
    const response = await apiClient.put<UpdatePromptResponse>(
      `/prompts/${id}`,
      data
    );
    return response.data;
  },

  // delete prompt
  deletePrompt: async (id: string): Promise<DeletePromptResponse> => {
    const response = await apiClient.delete<DeletePromptResponse>(
      `/prompts/${id}`
    );
    return response.data;
  },
};

// jobs API Endpoints
export const jobsApi = {
  // Create a new job
  createJob: async (): Promise<CreateJobResponse> => {
    const response = await apiClient.post<CreateJobResponse>(
      API_ENDPOINTS.JOBS.CREATE
    );
    return response.data;
  },

  // Upload files for a job
  uploadJobFiles: async (
    jobId: string,
    data: UploadJobFilesRequest
  ): Promise<UploadJobResponse> => {
    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("audio", data.audio);

    if (data.language) formData.append("language", data.language);
    if (data.orientation) formData.append("orientation", data.orientation);
    if (data.size) formData.append("size", data.size);
    if (data.productPosition)
      formData.append("productPosition", data.productPosition);
    if (data.backgroundColor)
      formData.append("backgroundColor", data.backgroundColor);
    if (data.customWidth)
      formData.append("customWidth", data.customWidth.toString());
    if (data.customHeight)
      formData.append("customHeight", data.customHeight.toString());
    if (data.minimalPadding !== undefined)
      formData.append("minimalPadding", data.minimalPadding.toString());
    if (data.paddingRatio !== undefined)
      formData.append("paddingRatio", data.paddingRatio.toString());
    if (data.useCase) formData.append("useCase", data.useCase);
    if (data.assetConfig) formData.append("assetConfig", data.assetConfig);

    const response = await apiClient.post<UploadJobResponse>(
      API_ENDPOINTS.JOBS.UPLOAD(jobId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // start processing job (triggers the SSE endpoint)
  startProcessing: async (jobId: string): Promise<void> => {
    // this endpoint starts the processing pipeline
    await apiClient.get(API_ENDPOINTS.JOBS.PROCESS(jobId));
  },

  // get all jobs with pagination
  getAllJobs: async (
    params?: GetAllJobsParams
  ): Promise<GetAllJobsResponse> => {
    const response = await apiClient.get<GetAllJobsResponse>(
      API_ENDPOINTS.JOBS.LIST,
      {
        params,
      }
    );
    return response.data;
  },

  // get job status
  getJobStatus: async (jobId: string): Promise<GetJobStatusResponse> => {
    const response = await apiClient.get<GetJobStatusResponse>(
      API_ENDPOINTS.JOBS.STATUS(jobId)
    );
    return response.data;
  },

  // get processing status (polling alternative to SSE)
  getProcessingStatus: async (
    jobId: string
  ): Promise<GetProcessingStatusResponse> => {
    const response = await apiClient.get<GetProcessingStatusResponse>(
      API_ENDPOINTS.JOBS.PROCESSING_STATUS(jobId)
    );
    return response.data;
  },

  // get job results
  getJobResults: async (jobId: string): Promise<GetJobResultsResponse> => {
    const response = await apiClient.get<GetJobResultsResponse>(
      API_ENDPOINTS.JOBS.RESULTS(jobId)
    );
    return response.data;
  },

  // download poster image
  downloadPoster: async (
    jobId: string,
    variantNumber: number
  ): Promise<DownloadPosterResponse> => {
    const response = await apiClient.get<DownloadPosterResponse>(
      API_ENDPOINTS.JOBS.DOWNLOAD(jobId, variantNumber)
    );
    return response.data;
  },
};
