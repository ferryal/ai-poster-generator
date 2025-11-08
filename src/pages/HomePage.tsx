import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PosterStepUpload } from "@/components/poster/steps";
import { StatsSection, FeaturesSection } from "@/components/home";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { useJobStore } from "@/stores";

export function HomePage() {
  const navigate = useNavigate();
  const { setUploadedFiles } = useJobStore();
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (imageFile: File, audioFile: File) => {
    setUploadedFiles(imageFile, audioFile);
    setError(null);

    navigate("/create-poster");
  };

  return (
    <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-0">
      <div className="text-center mb-12 relative">
        <div className="flex justify-center mb-4 relative z-10">
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Powered by{" "}
              <strong
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(270.09deg, #0B2242 0.07%, #22343F 11.01%, #BBA82C 26.12%, #266AA2 51.35%, #AA24A7 73.92%, #0C3141 90.44%, #0B2242 99.93%)",
                }}
              >
                Gemini 2.5 Flash
              </strong>
            </span>
          </Badge>
        </div>
        <h1 className="text-5xl font-bold mb-4 relative z-10">
          <span className="text-gray-900">Hamah </span>
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #1C57A8 32.21%, #1CA869 47.6%, #C40FB8 58.65%, #1C57A8 69.23%)",
            }}
          >
            Intelligence
          </span>
          <span className="text-gray-900"> Designer</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-3xl mx-auto relative z-10">
          Transform your product images and audio descriptions into stunning
          marketing posters with advanced AI technology. Professional results in
          seconds.
        </p>
      </div>

      <div className="relative">
        <PosterStepUpload
          onNext={handleUpload}
          isLoading={false}
          error={error}
        />
      </div>

      <StatsSection />

      <FeaturesSection />
    </div>
  );
}
