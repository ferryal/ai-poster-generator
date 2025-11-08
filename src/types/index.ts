// prompt types
export interface PromptVariable {
  name: string;
  description: string;
  required: boolean;
}

export interface PromptPerformanceMetrics {
  usageCount: number;
  successCount: number;
  failureCount: number;
  averageScore: number;
  lastUsed: string;
}

export interface PromptMetadata {
  createdBy: string;
  updatedBy?: string;
  notes?: string;
  tags: string[];
}

export interface Prompt {
  _id: string;
  name: string;
  type: "photoshoot" | "blending" | "copy" | "html" | "validation";
  category: string;
  version: string;
  template: string;
  variables: PromptVariable[];
  isActive: boolean;
  isDefault: boolean;
  performanceMetrics: PromptPerformanceMetrics;
  metadata: PromptMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PromptStats {
  totalPrompts: number;
  activePrompts: number;
  byType: {
    photoshoot: number;
    blending: number;
    copy: number;
    html: number;
    validation: number;
  };
  topPerforming: Array<{
    name: string;
    averageScore: number;
    usageCount: number;
  }>;
}

// api response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface GetPromptsResponse {
  success: boolean;
  prompts: Prompt[];
}

export interface GetPromptResponse {
  success: boolean;
  prompt: Prompt;
}

export interface GetPromptStatsResponse {
  success: boolean;
  stats: PromptStats;
}

export interface CreatePromptResponse {
  success: boolean;
  prompt: Prompt;
  message: string;
}

export interface UpdatePromptResponse {
  success: boolean;
  prompt: Prompt;
  message: string;
}

export interface DeletePromptResponse {
  success: boolean;
  message: string;
}

// request types
export interface GetPromptsParams {
  type?: "photoshoot" | "blending" | "copy" | "html" | "validation";
  category?: string;
  isActive?: boolean;
}

export interface CreatePromptRequest {
  name: string;
  type: "photoshoot" | "blending" | "copy" | "html" | "validation";
  category: string;
  version: string;
  template: string;
  variables: PromptVariable[];
  isActive: boolean;
  isDefault: boolean;
  metadata: {
    createdBy: string;
    notes?: string;
    tags: string[];
  };
}

export interface UpdatePromptRequest {
  name?: string;
  type?: "photoshoot" | "blending" | "copy" | "html" | "validation";
  category?: string;
  version?: string;
  template?: string;
  variables?: PromptVariable[];
  isActive?: boolean;
  isDefault?: boolean;
  metadata?: {
    updatedBy?: string;
    notes?: string;
    tags?: string[];
  };
}

// job types
export type JobStatus =
  | "created"
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";

export type ProcessingStep =
  | "transcription"
  | "copy_generation"
  | "photoshoot_transform"
  | "sharp_expansion"
  | "image_blending"
  | "upscaling"
  | "html_generation"
  | "html_to_image";

export interface ProcessingStepInfo {
  step: ProcessingStep;
  status: "pending" | "processing" | "completed" | "failed";
  completedAt: string | null;
  duration: number | null;
}

export interface CopyContent {
  headline: {
    en: string;
    ar: string;
  };
  subheadline: {
    en: string;
    ar: string;
  };
  cta: {
    en: string;
    ar: string;
  };
}

export interface OriginalImage {
  url: string;
  originalFilename: string;
  size: number;
}

export interface ProcessedImage {
  type: "photoshoot" | "sharp_expanded" | "blended" | "upscaled";
  url: string;
  key: string;
}

export interface ValidationScore {
  readabilityIssues: string[];
  suggestions: string[];
}

export interface Design {
  _id?: string;
  variantNumber: 1 | 2 | 3;
  html: string;
  previewUrl?: string;
  imageUrl?: string;
  imageKey?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  format?: string;
  validationScore?: ValidationScore;
}

export interface PosterSettings {
  language?: "en" | "ar";
  orientation?: "horizontal" | "vertical" | "square";
  size?: "standard" | "large" | "social" | "banner" | "poster" | "custom";
  productPosition?: "left" | "right" | "top" | "bottom" | "center";
  backgroundColor?: string;
  customWidth?: number;
  customHeight?: number;
  minimalPadding?: boolean;
  paddingRatio?: number;
  useCase?: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  transcription?: string;
  copyContent?: CopyContent;
  originalImage?: OriginalImage;
  designCount?: number;
  processingSteps: ProcessingStepInfo[];
  designs: Design[];
  processedImages: ProcessedImage[];
  posterSettings?: PosterSettings;
  error?: string | null;
}

// job api request types
export interface CreateJobRequest {}

export interface UploadJobFilesRequest {
  image: File;
  audio: File;
  language?: "en" | "ar";
  orientation?: "horizontal" | "vertical" | "square";
  size?: string;
  productPosition?: "left" | "right" | "top" | "bottom" | "center";
  backgroundColor?: string;
  customWidth?: number;
  customHeight?: number;
  minimalPadding?: boolean;
  paddingRatio?: number;
  useCase?: string;
  assetConfig?: string;
}

// job api response types
export interface CreateJobResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface UploadJobResponse {
  success: boolean;
  message: string;
  job: {
    id: string;
    status: JobStatus;
    posterSettings: PosterSettings;
  };
}

export interface GetJobStatusResponse {
  success: boolean;
  job: Job;
}

export interface GetJobResultsResponse {
  success: boolean;
  results: {
    copyContent: CopyContent;
    designs: Design[];
    processedImages: ProcessedImage[];
  };
}

export interface GetProcessingStatusResponse {
  success: boolean;
  status: JobStatus;
  currentStep: ProcessingStep;
  completedSteps: ProcessingStep[];
  progress: {
    completed: number;
    total: number;
  };
  partialResults: {
    transcription?: string;
    copyContent?: CopyContent;
    processedImages: ProcessedImage[];
    designs: Design[];
  };
}

export interface DownloadPosterResponse {
  success: boolean;
  downloadUrl: string;
  filename: string;
  expiresIn: number;
}

export interface GetAllJobsParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  includeDesigns?: boolean;
}

export interface GetAllJobsResponse {
  success: boolean;
  data: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// SSE event types
export type SSEEventType =
  | "connected"
  | "step_start"
  | "step_complete"
  | "design_generated"
  | "image_generated"
  | "pipeline_complete"
  | "pipeline_error";

export interface SSEBaseEvent {
  type: SSEEventType;
  message: string;
}

export interface SSEConnectedEvent extends SSEBaseEvent {
  type: "connected";
  jobId: string;
}

export interface SSEStepStartEvent extends SSEBaseEvent {
  type: "step_start";
  step: ProcessingStep;
}

export interface SSEStepCompleteEvent extends SSEBaseEvent {
  type: "step_complete";
  step: ProcessingStep;
  result: any;
}

export interface SSEDesignGeneratedEvent extends SSEBaseEvent {
  type: "design_generated";
  step: "html_generation";
  variantNumber: 1 | 2 | 3;
  result: Design;
}

export interface SSEImageGeneratedEvent extends SSEBaseEvent {
  type: "image_generated";
  step: "html_to_image";
  variantNumber: 1 | 2 | 3;
  result: {
    imageUrl: string;
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface SSEPipelineCompleteEvent extends SSEBaseEvent {
  type: "pipeline_complete";
  jobId: string;
  results: {
    copyContent: CopyContent;
    designs: Design[];
    processedImages: ProcessedImage[];
  };
}

export interface SSEPipelineErrorEvent extends SSEBaseEvent {
  type: "pipeline_error";
  error: string;
}

export type SSEEvent =
  | SSEConnectedEvent
  | SSEStepStartEvent
  | SSEStepCompleteEvent
  | SSEDesignGeneratedEvent
  | SSEImageGeneratedEvent
  | SSEPipelineCompleteEvent
  | SSEPipelineErrorEvent;
