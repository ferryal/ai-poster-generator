import { useState, useEffect, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  AudioLines,
  TextCursorInput,
  Expand,
  Blend,
  Wand,
  Code,
  GalleryHorizontalEnd,
  ScanLine,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobPolling } from "@/hooks/use-job-polling";
import { useCreateJob, useUploadJobFiles } from "@/mutations";
import { useJobStore } from "@/stores";
import type { ProcessingStep as ProcessingStepType } from "@/types";

interface PosterStepProcessingProps {
  onComplete: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface ProcessingStepDisplay {
  id: ProcessingStepType;
  title: string;
  description: string;
  icon: IconComponent;
}

const PROCESSING_STEPS: ProcessingStepDisplay[] = [
  {
    id: "transcription",
    title: "Transcribing Audio",
    description: "Converting speech to text using AI",
    icon: AudioLines,
  },
  {
    id: "copy_generation",
    title: "Generating Copy",
    description: "Creating marketing content in multiple languages",
    icon: TextCursorInput,
  },
  {
    id: "photoshoot_transform",
    title: "Studio Transformation",
    description: "Applying professional photography effects",
    icon: ScanLine,
  },
  {
    id: "sharp_expansion",
    title: "Canvas Expansion",
    description: "Intelligently expanding image canvas",
    icon: Expand,
  },
  {
    id: "image_blending",
    title: "Image Blending",
    description: "Merging elements for cohesive design",
    icon: Blend,
  },
  {
    id: "upscaling",
    title: "4K Upscaling",
    description: "Enhancing resolution to 4K quality",
    icon: Wand,
  },
  {
    id: "html_generation",
    title: "Generating Designs",
    description: "Creating multiple design variations",
    icon: Code,
  },
  {
    id: "html_to_image",
    title: "Converting to Images",
    description: "Converting HTML designs to high-quality images",
    icon: GalleryHorizontalEnd,
  },
];

export function PosterStepProcessing({
  onComplete,
  onCancel,
  onRetry,
}: PosterStepProcessingProps) {
  const [isPipelineExpanded, setIsPipelineExpanded] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [activeVariant, setActiveVariant] = useState(1);
  const [showMoreTranscription, setShowMoreTranscription] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const {
    uploadedImage,
    uploadedAudio,
    posterSettings,
    updateJobProgress,
    setError,
    setCurrentJobId,
  } = useJobStore();

  const { mutateAsync: createJob } = useCreateJob();
  const { mutateAsync: uploadJobFiles } = useUploadJobFiles();

  // Step 3: Create job and upload files when component mounts
  // Use ref to prevent double execution in React StrictMode
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasInitialized.current) return;

    const initializeJob = async () => {
      try {
        setIsInitializing(true);
        console.log("[PosterStepProcessing] Creating job...");

        // Mark as initialized to prevent double execution
        hasInitialized.current = true;

        // 1. Create job
        const createResponse = await createJob();
        const newJobId = createResponse.jobId;
        setJobId(newJobId);
        setCurrentJobId(newJobId);

        console.log("[PosterStepProcessing] Job created:", newJobId);

        // 2. Upload files with settings
        console.log("[PosterStepProcessing] Uploading files...");

        // Map settings to API format
        const languageMap: Record<string, "en" | "ar"> = {
          English: "en",
          Arabic: "ar",
        };

        const orientationMap: Record<
          string,
          "horizontal" | "vertical" | "square"
        > = {
          Horizontal: "horizontal",
          Vertical: "vertical",
          Square: "square",
        };

        const orientation =
          orientationMap[posterSettings.orientation] || "vertical";

        // Build assetConfig
        const fonts: string[] = [];
        if (posterSettings.fonts?.effraRegular) fonts.push("effra_regular");
        if (posterSettings.fonts?.effraBold) fonts.push("effra_bold");
        if (posterSettings.fonts?.effraThin) fonts.push("effra_thin");

        const images: string[] = [];
        if (posterSettings.images?.logoBottomLeft)
          images.push("logo_bottom_left");
        if (posterSettings.images?.logoTopLeft) images.push("logo_top_left");
        if (posterSettings.images?.logoTopRight) images.push("logo_top_right");
        if (posterSettings.images?.ctaPatternIcon)
          images.push("cta_pattern_icon");
        if (posterSettings.images?.textBackgroundShape)
          images.push("text_background_shape");

        const assetConfig = JSON.stringify({ fonts, images });

        await uploadJobFiles({
          jobId: newJobId,
          data: {
            image: uploadedImage!,
            audio: uploadedAudio!,
            language: languageMap[posterSettings.language] || "en",
            orientation: orientation,
            size: posterSettings.size || "standard",
            productPosition: posterSettings.productPosition as any,
            backgroundColor: posterSettings.backgroundColor,
            minimalPadding: posterSettings.minimalPadding !== false,
            assetConfig: assetConfig,
          },
        });

        console.log("[PosterStepProcessing] Files uploaded successfully");

        // 3. Connect to SSE to start processing
        console.log(
          "[PosterStepProcessing] Connecting to SSE /process endpoint..."
        );
        const url = `https://ai-poster-api-staging.hi-lab.ai/api/jobs/${newJobId}/process`;
        const eventSource = new EventSource(url);

        eventSource.onopen = () => {
          console.log("[PosterStepProcessing] SSE connection opened");
        };

        eventSource.onerror = (err) => {
          console.log(
            "[PosterStepProcessing] SSE connection error (expected - will use polling):",
            err
          );
          eventSource.close();
        };

        setIsInitializing(false);

        // Cleanup
        return () => {
          eventSource.close();
        };
      } catch (err) {
        console.error("[PosterStepProcessing] Failed to initialize job:", err);
        setInitError("Failed to start processing. Please try again.");
        setIsInitializing(false);
      }
    };

    initializeJob();
  }, [uploadedImage, uploadedAudio, posterSettings, createJob, uploadJobFiles]);

  // use polling hook for reliable status updates (polls every 4 seconds)
  // only enable after job is created
  const {
    progress,
    currentStep,
    completedSteps,
    transcription,
    designs,
    processedImages,
    error,
  } = useJobPolling({
    jobId: jobId || "",
    pollInterval: 4000,
    enabled: !!jobId && !isInitializing,
    onComplete: (results) => {
      // update job store with final results
      updateJobProgress({
        status: "completed",
        copyContent: results.copyContent,
        designs: results.designs,
        processedImages: results.processedImages,
      });

      setTimeout(() => onComplete(), 1000);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    },
  });

  useEffect(() => {
    if (uploadedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(uploadedImage);
    }
  }, [uploadedImage]);

  // use upscaled image as preview if available
  useEffect(() => {
    const upscaledImage = processedImages.find(
      (img) => img.type === "upscaled"
    );
    if (upscaledImage) {
      setPreviewUrl(upscaledImage.url);
    }
  }, [processedImages]);

  const completedStepsCount = completedSteps.length;
  const isAlmostComplete = progress >= 85 || designs.length > 0;

  // get active design variant
  const activeDesign = designs.find((d) => d.variantNumber === activeVariant);

  // progress bar helpers
  const SEGMENTS_PER_STEP = 8;
  const totalSegments = PROCESSING_STEPS.length * SEGMENTS_PER_STEP;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const activeSegments = Math.round((clampedProgress / 100) * totalSegments);

  const hasError = initError || error;
  const isFailed = error === "Job processing failed";

  if (hasError || isFailed) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Processing Failed
              </h2>
              <p className="text-gray-600">
                {initError ||
                  error ||
                  "Something went wrong during processing. Please try again."}
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={onCancel} className="px-6">
                Go Back
              </Button>
              <Button
                onClick={onRetry}
                className="px-6 text-white"
                style={{
                  background:
                    "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
                }}
              >
                Try Again
              </Button>
            </div>

            {/* Show partial results if available */}
            {transcription && (
              <div className="mt-8 w-full text-left p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Partial Results
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Transcription
                    </p>
                    <p className="text-sm text-gray-900">{transcription}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Completed Steps
                    </p>
                    <p className="text-sm text-gray-900">
                      {completedSteps.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#0B2242] animate-spin mb-4" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Initializing...
              </h2>
              <p className="text-sm text-gray-500">
                Creating job and uploading files
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side - Processing Status */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-gray-200 bg-white p-6 px-3 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {progress}% Completed
              </h2>
              <p className="text-sm text-gray-500">
                {progress === 0
                  ? "We're trying to convert your speech to text using AI..."
                  : progress < 15
                  ? "We're trying to convert your speech to text using AI..."
                  : progress < 85
                  ? "Almost done, preparing multiple design variants for you to review..."
                  : "Almost done, preparing multiple design variants for you to review..."}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-[3px] rounded-full bg-white px-[3px] py-[6px]">
                {Array.from({
                  length: totalSegments,
                }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-[43px] w-[6px] rounded-full transition-colors duration-200",
                      index < activeSegments ? "bg-[#0B2242]" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 text-right">
                {completedStepsCount} out of {PROCESSING_STEPS.length} steps
              </p>
            </div>

            {/* Processing Pipeline */}
            <div className=" overflow-hidden">
              <button
                onClick={() => setIsPipelineExpanded(!isPipelineExpanded)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">
                  Processing Pipeline
                </span>
                {isPipelineExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isPipelineExpanded && (
                <div className="p-4 bg-white border-gray-200">
                  <div className="space-y-1 relative">
                    {PROCESSING_STEPS.map((step, index) => {
                      const isCompleted = completedSteps.includes(step.id);
                      const isCurrent = currentStep === step.id;
                      const StepIcon = step.icon;
                      const showConnector = index < PROCESSING_STEPS.length - 1;

                      return (
                        <div key={step.id} className="relative">
                          <div className="flex items-start gap-3 p-3 rounded-lg transition-all">
                            {/* Step Icon */}
                            <div
                              className={cn(
                                "relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2",
                                isCompleted || isCurrent
                                  ? "bg-[#0B2242] text-white border-[#0B2242]"
                                  : "bg-white text-gray-400 border-gray-200"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="w-5 h-5 text-white" />
                              ) : (
                                <StepIcon
                                  className={cn(
                                    "w-5 h-5",
                                    isCurrent ? "text-white" : "text-gray-400"
                                  )}
                                />
                              )}

                              {showConnector && (
                                <div
                                  className="absolute left-1/2 top-full h-[36px] w-px -translate-x-1/2"
                                  style={{
                                    background: isCompleted
                                      ? "#0B2242"
                                      : isCurrent
                                      ? "linear-gradient(to bottom, #0B2242 50%, #E5E7EB 50%)"
                                      : "#E5E7EB",
                                  }}
                                />
                              )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 min-w-0 pt-1.5">
                              <h4
                                className={cn(
                                  "font-semibold text-sm",
                                  isCompleted || isCurrent
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                )}
                              >
                                {step.title}
                              </h4>
                              <p
                                className={cn(
                                  "text-xs mt-0.5",
                                  isCompleted || isCurrent
                                    ? "text-gray-600"
                                    : "text-gray-400"
                                )}
                              >
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {showConnector && <div className="h-2" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side - Preview */}
        <div className="space-y-6">
          <div className="sticky top-0 space-y-4">
            <Card className="rounded-xl border border-gray-200 bg-[#F9F9F9] p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Preview</h3>

              {/* Preview Canvas */}
              <div className="space-y-4">
                {/* Variant Tabs */}
                {isAlmostComplete && designs.length > 0 && (
                  <div className="flex gap-2 border-b shadow-sm">
                    {designs.map((design) => (
                      <button
                        key={design.variantNumber}
                        onClick={() => setActiveVariant(design.variantNumber)}
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors relative",
                          activeVariant === design.variantNumber
                            ? "text-gray-900"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Variant {design.variantNumber}
                        {activeVariant === design.variantNumber && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B2242]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Canvas/Preview Area */}
                <div className="overflow-hidden min-h-[500px] flex items-center justify-center">
                  {isAlmostComplete && designs.length > 0 ? (
                    <div className="w-full p-6">
                      {activeDesign?.imageUrl || activeDesign?.previewUrl ? (
                        <div className="rounded-lg overflow-hidden shadow-lg transition-opacity duration-500 ease-in animate-fade-in">
                          <img
                            src={
                              activeDesign.imageUrl ||
                              activeDesign.previewUrl ||
                              ""
                            }
                            alt={`Design Variant ${activeVariant}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="animate-pulse text-gray-400 mb-2">
                            <svg
                              className="w-12 h-12 mx-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500">
                            Generating variant {activeVariant}...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : processedImages.length > 0 ? (
                    /* Show processed images with fade-in animation */
                    <div className="w-full p-6 transition-opacity duration-700 ease-in animate-fade-in">
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={processedImages[processedImages.length - 1].url}
                          alt="Processing preview"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  ) : previewUrl ? (
                    <div className="w-full p-6 transition-opacity duration-500 ease-in animate-fade-in">
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={previewUrl}
                          alt="Uploaded preview"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-white" />
                  )}
                </div>

                {/* Audio Transcription */}
                {transcription && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Audio Transcription
                    </h4>
                    <div className="text-sm text-gray-600">
                      {showMoreTranscription || transcription.length < 70 ? (
                        transcription
                      ) : (
                        <>
                          {transcription.substring(0, 70)}...{" "}
                          <button
                            onClick={() => setShowMoreTranscription(true)}
                            className="inline-flex items-center px-2 py-1 text-xs bg-[#0B2242] text-white rounded font-medium hover:bg-[#0B2242]/90 transition-colors"
                          >
                            be more...
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-gray-200">
        {isAlmostComplete ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <div className="text-sm text-gray-500">
              Processing will complete automatically...
            </div>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onCancel}>
              Previous
            </Button>
            <Button
              disabled
              className="px-6 text-white opacity-50 cursor-not-allowed"
              style={{
                background:
                  "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
              }}
            >
              Generate
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
