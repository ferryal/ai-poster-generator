import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Download,
  Grid3x3,
  Code2,
  List,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useJobResults } from "@/queries";
import { VariantPreviewCard, VariantCodeBlock } from "@/components/poster";
import { jobsApi } from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "list" | "grid" | "code";

export function GalleryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<1 | 2 | 3>(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useJobResults(id);

  const copyContent = data?.results?.copyContent;
  const designs = data?.results?.designs || [];

  const selectedDesign = useMemo(() => {
    return designs.find((design) => design.variantNumber === selectedVariant);
  }, [designs, selectedVariant]);

  const title = useMemo(() => {
    if (!copyContent?.headline?.en) return "Untitled Poster";
    return copyContent.headline.en;
  }, [copyContent]);

  const handleCopyImage = async (variantNumber: number) => {
    const design = designs.find((d) => d.variantNumber === variantNumber);
    if (!design?.imageUrl) return;

    try {
      const response = await fetch(design.imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      console.log("Image copied to clipboard");
    } catch (error) {
      console.error("Failed to copy image:", error);
    }
  };

  const handleDownloadPNG = async (variantNumber: number) => {
    if (!id) {
      toast({
        title: "Download failed",
        description: "Missing job ID for this poster.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await jobsApi.downloadPoster(id, variantNumber);

      const link = document.createElement("a");
      link.href = response.downloadUrl;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `Poster variant ${variantNumber} is downloading.`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      const design = designs.find((d) => d.variantNumber === variantNumber);
      if (design?.imageUrl) {
        const a = document.createElement("a");
        a.href = design.imageUrl;
        a.download = `poster-variant-${variantNumber}.png`;
        a.click();

        toast({
          title: "Download started",
          description: `Using the backup image for variant ${variantNumber}.`,
        });
      } else {
        toast({
          title: "Download failed",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong while downloading.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyCode = (variantNumber: number) => {
    const design = designs.find((d) => d.variantNumber === variantNumber);
    if (!design?.html) return;
    navigator.clipboard.writeText(design.html);
  };

  const handleDownloadCode = (variantNumber: number) => {
    const design = designs.find((d) => d.variantNumber === variantNumber);
    if (!design?.html) {
      toast({
        title: "Download unavailable",
        description: "This variant does not have HTML content to download.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([design.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-variant-${variantNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `HTML for variant ${variantNumber} is downloading.`,
    });
  };

  // loading state
  if (isLoading) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            <p className="text-gray-600">Loading poster details...</p>
          </div>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={() => navigate("/gallery")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:opacity-100 hover:bg-transparent mb-6 h-auto px-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">Back</span>
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Failed to load poster
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // no designs available
  if (designs.length === 0) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={() => navigate("/gallery")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:opacity-100 hover:bg-transparent mb-6 h-auto px-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">Back</span>
        </Button>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">
            No designs available
          </h2>
          <p className="text-gray-600">
            This job doesn't have any design variants yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    // <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button
          onClick={() => navigate("/gallery")}
          variant="ghost"
          className="flex items-center gap-2 text-gray-600 hover:opacity-100 hover:bg-transparent mb-6 h-auto px-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">Back</span>
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-sm text-gray-500">Job ID: {id}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              {designs.map((design) => (
                <Button
                  key={design.variantNumber}
                  onClick={() => setSelectedVariant(design.variantNumber)}
                  variant={
                    selectedVariant === design.variantNumber
                      ? "outline"
                      : "ghost"
                  }
                  className={`px-4 py-2 h-auto text-sm font-medium rounded-xl ${
                    selectedVariant === design.variantNumber
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-white"
                  }`}
                >
                  Variant {design.variantNumber}
                </Button>
              ))}
            </div>

            {/* View Options */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "outline" : "ghost"}
                size="icon"
                className={`p-2 h-auto w-auto rounded-xl ${
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "outline" : "ghost"}
                size="icon"
                className={`p-2 h-auto w-auto rounded-xl ${
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode("code")}
                variant={viewMode === "code" ? "outline" : "ghost"}
                size="icon"
                className={`p-2 h-auto w-auto rounded-xl ${
                  viewMode === "code" ? "bg-white shadow-sm" : ""
                }`}
                title="Code view"
              >
                <Code2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "list" && (
        <>
          <VariantPreviewCard
            imageUrl={selectedDesign?.imageUrl}
            title={title}
            variantNumber={selectedVariant}
            onCopyImage={() => handleCopyImage(selectedVariant)}
            onDownloadPNG={() => handleDownloadPNG(selectedVariant)}
          />
          <div className="mt-6">
            <VariantCodeBlock
              variantNumber={selectedVariant}
              htmlCode={selectedDesign?.html}
              title={title}
              onCopyCode={() => handleCopyCode(selectedVariant)}
              onDownloadCode={() => handleDownloadCode(selectedVariant)}
            />
          </div>
        </>
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div key={design.variantNumber} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Variant {design.variantNumber}
              </h3>
              <Card className="rounded-xl p-4 border border-gray-200 bg-[#F9F9F9]">
                {design.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden shadow-lg mb-4">
                    <img
                      src={design.imageUrl}
                      alt={`${title} - Variant ${design.variantNumber}`}
                      className="w-full h-auto"
                      style={{
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-64 bg-gray-200 rounded-xl mb-4">
                    <p className="text-gray-500">No preview</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyImage(design.variantNumber)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => handleDownloadPNG(design.variantNumber)}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {viewMode === "code" && (
        <div className="flex flex-col gap-6">
          {designs.map((design) => (
            <VariantCodeBlock
              key={design.variantNumber}
              variantNumber={design.variantNumber}
              htmlCode={design.html}
              title={title}
              onCopyCode={() => handleCopyCode(design.variantNumber)}
              onDownloadCode={() => handleDownloadCode(design.variantNumber)}
              defaultExpanded={design.variantNumber === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
