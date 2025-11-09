import type { GetPromptsParams, GetAllJobsParams } from "@/types";

export const queryKeys = {
  prompts: {
    all: ["prompts"] as const,
    lists: () => [...queryKeys.prompts.all, "list"] as const,
    list: (params?: GetPromptsParams) =>
      [...queryKeys.prompts.lists(), params] as const,
    details: () => [...queryKeys.prompts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.prompts.details(), id] as const,
    stats: () => [...queryKeys.prompts.all, "stats"] as const,
  },
  settings: {
    all: ["settings"] as const,
    posterPresets: () => [...queryKeys.settings.all, "poster-presets"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    list: (params?: GetAllJobsParams) =>
      [...queryKeys.jobs.lists(), params] as const,
    details: () => [...queryKeys.jobs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    results: (id: string) => [...queryKeys.jobs.detail(id), "results"] as const,
    status: (id: string) => [...queryKeys.jobs.detail(id), "status"] as const,
  },
} as const;
