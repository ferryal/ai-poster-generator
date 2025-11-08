// API Configuration
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://ai-poster-api-staging.hi-lab.ai/api",
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30 seconds
  RETRY_ATTEMPTS: Number(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: Number(import.meta.env.VITE_RETRY_DELAY) || 1000, // 1 second
} as const;

// API Endpoints paths
export const API_ENDPOINTS = {
  PROMPTS: {
    LIST: "/prompts",
    STATS: "/prompts/stats",
    DETAIL: (id: string) => `/prompts/${id}`,
    CREATE: "/prompts",
    UPDATE: (id: string) => `/prompts/${id}`,
    DELETE: (id: string) => `/prompts/${id}`,
  },
  JOBS: {
    CREATE: "/jobs/create",
    LIST: "/jobs",
    UPLOAD: (jobId: string) => `/jobs/${jobId}/upload`,
    PROCESS: (jobId: string) => `/jobs/${jobId}/process`,
    STATUS: (jobId: string) => `/jobs/${jobId}/status`,
    PROCESSING_STATUS: (jobId: string) => `/jobs/${jobId}/processing-status`,
    RESULTS: (jobId: string) => `/jobs/${jobId}/results`,
    DOWNLOAD: (jobId: string, variantNumber: number) =>
      `/jobs/${jobId}/download/${variantNumber}`,
  },
} as const;

// Query Configuration
export const QUERY_CONFIG = {
  STALE_TIME: 1000 * 60 * 5, // 5 minutes
  CACHE_TIME: 1000 * 60 * 10, // 10 minutes
  RETRY: 1,
} as const;
