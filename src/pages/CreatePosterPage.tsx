import { useState } from "react";
import {
  PosterStepUpload,
  PosterStepSettings,
  PosterStepProcessing,
  PosterStepResults,
} from "@/components/poster/steps";
import {
  CloudUpload,
  Settings2,
  ScanText,
  BadgeCheck,
  CircleCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobStore } from "@/stores";

const steps = [
  { id: 1, name: "Upload", icon: CloudUpload },
  { id: 2, name: "Settings", icon: Settings2 },
  { id: 3, name: "Processing", icon: ScanText },
  { id: 4, name: "Results", icon: BadgeCheck },
];

export function CreatePosterPage() {
  const {
    uploadedImage,
    uploadedAudio,
    posterSettings,
    setUploadedFiles,
    setPosterSettings: updatePosterSettings,
    clearCurrentJob,
  } = useJobStore();

  // If files are already uploaded (from HomePage), start at step 2
  const [currentStep, setCurrentStep] = useState(
    uploadedImage && uploadedAudio ? 2 : 1
  );
  const [error, setError] = useState<string | null>(null);

  // Initialize local state from store or use defaults
  const [localSettings, setLocalSettings] = useState(
    posterSettings || {
      language: "English",
      orientation: "Vertical",
      size: "standard",
      productPosition: "center",
      backgroundColor: "beige",
      minimalPadding: true,
      fonts: {
        effraRegular: true,
        effraBold: true,
        effraThin: false,
      },
      images: {
        ctaPatternIcon: true,
        logoBottomLeft: true,
        logoTopLeft: false,
        logoTopRight: false,
        textBackgroundShape: false,
      },
    }
  );

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpload = (imageFile: File, audioFile: File) => {
    // Step 1: Store files in Zustand for retry functionality
    setUploadedFiles(imageFile, audioFile);
    setError(null);

    // Move to settings step
    handleNext();
  };

  const handleStartProcessing = () => {
    // Step 2: Store settings in Zustand and validate
    updatePosterSettings(localSettings);

    if (!uploadedImage || !uploadedAudio) {
      setError("Missing uploaded image or audio file");
      return;
    }

    setError(null);
    // Move to Step 3 - it will handle job creation and upload
    handleNext();
  };

  const handleRetry = () => {
    // Go back to Step 1 but keep uploaded files and settings
    setCurrentStep(1);
    setError(null);
    // Clear job ID so we create a new job
    clearCurrentJob();
  };

  const handleCleanup = () => {
    clearCurrentJob();
    // Clear files from store
    setUploadedFiles(null as any, null as any);
    updatePosterSettings(null);
    setError(null);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="px-8 pb-10 text-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          Create Your Poster
        </h1>
        <p className="text-base text-gray-500">
          Upload your files and let AI do the magic
        </p>
      </div>

      {/* Progress Steps */}
      <div className="px-8 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center min-w-auto">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center transition-all mb-3",
                        isActive
                          ? "bg-[#0B2242] text-white"
                          : isCompleted
                          ? "bg-[#0B2242] text-white"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <CircleCheck className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        Step {step.id}
                      </div>
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-gray-900" : "text-gray-600"
                        )}
                      >
                        {step.name}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="w-40 h-0.5 mb-12 mx-0 relative"
                      style={{
                        background: isCompleted
                          ? "#0B2242"
                          : isActive
                          ? "linear-gradient(to right, #0B2242 50%, #E5E7EB 50%)"
                          : "#E5E7EB",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {currentStep === 1 && (
          <PosterStepUpload
            onNext={handleUpload}
            isLoading={false}
            error={error}
          />
        )}
        {currentStep === 2 && (
          <PosterStepSettings
            settings={localSettings}
            onSettingsChange={setLocalSettings}
            onNext={handleStartProcessing}
            onPrevious={handlePrevious}
            uploadedImage={uploadedImage}
            isLoading={false}
            error={error}
          />
        )}
        {currentStep === 3 && (
          <PosterStepProcessing
            onComplete={handleNext}
            onCancel={handlePrevious}
            onRetry={handleRetry}
          />
        )}
        {currentStep === 4 && (
          <PosterStepResults
            onCreateAnother={() => {
              handleCleanup();
              setCurrentStep(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
