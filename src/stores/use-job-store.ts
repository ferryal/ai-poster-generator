import { create } from "zustand";
import type { Job, Design, ProcessedImage, CopyContent } from "@/types";

interface JobState {
  // Current active job being created/processed
  currentJobId: string | null;
  currentJob: Job | null;

  // Step 1 & Step 2 data (for retry functionality)
  uploadedImage: File | null;
  uploadedAudio: File | null;
  posterSettings: any | null;

  // Job management
  setCurrentJob: (job: Job | null) => void;
  setCurrentJobId: (jobId: string | null) => void;
  updateJobStatus: (status: Job["status"]) => void;
  updateJobProgress: (updates: Partial<Job>) => void;
  addDesign: (design: Design) => void;
  updateDesign: (variantNumber: number, updates: Partial<Design>) => void;
  addProcessedImage: (image: ProcessedImage) => void;
  setTranscription: (transcription: string) => void;
  setCopyContent: (copyContent: CopyContent) => void;
  setError: (error: string | null) => void;

  // Store uploaded files and settings
  setUploadedFiles: (image: File, audio: File) => void;
  setPosterSettings: (settings: any) => void;

  clearCurrentJob: () => void;
}

export const useJobStore = create<JobState>((set) => ({
  currentJobId: null,
  currentJob: null,
  uploadedImage: null,
  uploadedAudio: null,
  posterSettings: null,

  setCurrentJob: (job) => {
    set({
      currentJob: job,
      currentJobId: job?.id || null,
    });
  },

  setCurrentJobId: (jobId) => {
    set({ currentJobId: jobId });
  },

  updateJobStatus: (status) => {
    set((state) => ({
      currentJob: state.currentJob
        ? {
            ...state.currentJob,
            status,
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },

  updateJobProgress: (updates) => {
    set((state) => ({
      currentJob: state.currentJob
        ? {
            ...state.currentJob,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },

  addDesign: (design) => {
    set((state) => {
      if (!state.currentJob) return state;

      const existingDesigns = state.currentJob.designs.filter(
        (d) => d.variantNumber !== design.variantNumber
      );

      return {
        currentJob: {
          ...state.currentJob,
          designs: [...existingDesigns, design].sort(
            (a, b) => a.variantNumber - b.variantNumber
          ),
          designCount: existingDesigns.length + 1,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  updateDesign: (variantNumber, updates) => {
    set((state) => {
      if (!state.currentJob) return state;

      return {
        currentJob: {
          ...state.currentJob,
          designs: state.currentJob.designs.map((design) =>
            design.variantNumber === variantNumber
              ? { ...design, ...updates }
              : design
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  addProcessedImage: (image) => {
    set((state) => {
      if (!state.currentJob) return state;

      return {
        currentJob: {
          ...state.currentJob,
          processedImages: [...state.currentJob.processedImages, image],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  setTranscription: (transcription) => {
    set((state) => ({
      currentJob: state.currentJob
        ? {
            ...state.currentJob,
            transcription,
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },

  setCopyContent: (copyContent) => {
    set((state) => ({
      currentJob: state.currentJob
        ? {
            ...state.currentJob,
            copyContent,
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },

  setError: (error) => {
    set((state) => ({
      currentJob: state.currentJob
        ? {
            ...state.currentJob,
            error,
            status: error ? "failed" : state.currentJob.status,
            updatedAt: new Date().toISOString(),
          }
        : null,
    }));
  },

  setUploadedFiles: (image, audio) => {
    set({
      uploadedImage: image,
      uploadedAudio: audio,
    });
  },

  setPosterSettings: (settings) => {
    set({
      posterSettings: settings,
    });
  },

  clearCurrentJob: () => {
    set({
      currentJobId: null,
      currentJob: null,
    });
  },
}));
