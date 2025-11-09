import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Design } from "@/types";
import { VariantPreviewCard, VariantCodeBlock } from "@/components/poster";
import { Copy, Download, Grid3x3, Code2, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobStore } from "@/stores";
import { jobsApi } from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";
import { useJobResults } from "@/queries";

interface PosterStepResultsProps {
  onCreateAnother: () => void;
}

type ViewMode = "list" | "grid" | "code";

type VariantNumber = 1 | 2 | 3;

export function PosterStepResults({ onCreateAnother }: PosterStepResultsProps) {
  const { toast } = useToast();
  const currentJob = useJobStore((state) => state.currentJob);
  const currentJobId = useJobStore((state) => state.currentJobId);

  const jobIdForResults = currentJobId ?? currentJob?.id;
  const {
    data: jobResults,
    isLoading,
    isError,
  } = useJobResults(jobIdForResults);

  const designs: Design[] =
    jobResults?.results?.designs ?? currentJob?.designs ?? [];
  const copyContent =
    jobResults?.results?.copyContent ?? currentJob?.copyContent;
  const title = copyContent?.headline?.en ?? "Untitled Poster";

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedVariant, setSelectedVariant] = useState<VariantNumber>(1);

  const variantNumbers = useMemo(() => {
    return designs
      .map((design) => design.variantNumber)
      .sort((a, b) => a - b) as VariantNumber[];
  }, [designs]);

  useEffect(() => {
    if (
      variantNumbers.length > 0 &&
      !variantNumbers.includes(selectedVariant)
    ) {
      setSelectedVariant(variantNumbers[0]);
    }
  }, [variantNumbers, selectedVariant]);

  const selectedDesign = useMemo(
    () => designs.find((design) => design.variantNumber === selectedVariant),
    [designs, selectedVariant]
  );

  const showEmptyState = !isLoading && !isError && designs.length === 0;

  const handleCopyImage = async (variantNumber: VariantNumber) => {
    const design = designs.find((item) => item.variantNumber === variantNumber);

    if (!design?.imageUrl) {
      toast({
        title: "Copy unavailable",
        description: "No image available for this variant yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(design.imageUrl);
      const blob = await response.blob();
      const clipboardItemCtor =
        typeof window !== "undefined"
          ? (window as any).ClipboardItem
          : undefined;

      if (navigator.clipboard && clipboardItemCtor) {
        await navigator.clipboard.write([
          new clipboardItemCtor({ [blob.type]: blob }),
        ]);
        toast({
          title: "Image copied",
          description: `Variant ${variantNumber} copied to clipboard.`,
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `poster-variant-${variantNumber}.png`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading variant ${variantNumber}.`,
      });
    } catch (error) {
      console.error("Failed to copy image:", error);
      toast({
        title: "Copy failed",
        description: "We couldn't copy the image to your clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPNG = async (variantNumber: VariantNumber) => {
    const design = designs.find((item) => item.variantNumber === variantNumber);

    if (!design) {
      toast({
        title: "Download unavailable",
        description: "We couldn't find this design variant.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (jobIdForResults) {
        const response = await jobsApi.downloadPoster(
          jobIdForResults,
          variantNumber
        );
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
        return;
      }

      if (design.imageUrl) {
        const a = document.createElement("a");
        a.href = design.imageUrl;
        a.download = `poster-variant-${variantNumber}.png`;
        a.click();

        toast({
          title: "Download started",
          description: `Using the preview image for variant ${variantNumber}.`,
        });
        return;
      }

      toast({
        title: "Download unavailable",
        description: "No image source found for this variant.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Download failed:", error);
      if (design.imageUrl) {
        const a = document.createElement("a");
        a.href = design.imageUrl;
        a.download = `poster-variant-${variantNumber}.png`;
        a.click();

        toast({
          title: "Download started",
          description: `Using the preview image for variant ${variantNumber}.`,
        });
      } else {
        toast({
          title: "Download failed",
          description: "Something went wrong while downloading.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyCode = async (variantNumber: VariantNumber) => {
    const design = designs.find((item) => item.variantNumber === variantNumber);

    if (!design?.html) {
      toast({
        title: "Copy unavailable",
        description: "This variant doesn't have HTML code yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(design.html);
      toast({
        title: "Code copied",
        description: `HTML for variant ${variantNumber} copied to clipboard.`,
      });
    } catch (error) {
      console.error("Failed to copy code:", error);
      toast({
        title: "Copy failed",
        description: "We couldn't copy the HTML code.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCode = (variantNumber: VariantNumber) => {
    const design = designs.find((item) => item.variantNumber === variantNumber);

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Loading results…
          </h2>
          <p className="text-sm text-gray-600">
            We’re preparing your design variants. This will just take a moment.
          </p>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Unable to load results
          </h2>
          <p className="text-sm text-gray-600">
            We couldn’t fetch your poster variants. Please try creating a new
            poster.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={onCreateAnother}
              variant="outline"
              className="px-6"
            >
              Start Over
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showEmptyState) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Designs are not available yet
          </h2>
          <p className="text-sm text-gray-600">
            We couldn't find any generated design variants for this poster.
            Please try creating a new poster.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={onCreateAnother}
              className="px-6 text-white"
              style={{
                background:
                  "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
              }}
            >
              Create Another Poster
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Design Variants</h2>
          {currentJobId && (
            <p className="text-sm text-gray-500">Job ID: {currentJobId}</p>
          )}
          {copyContent?.subheadline?.en && (
            <p className="text-sm text-gray-500 max-w-2xl">
              {copyContent.subheadline.en}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            {variantNumbers.map((variant) => (
              <Button
                key={variant}
                onClick={() => setSelectedVariant(variant)}
                variant={selectedVariant === variant ? "outline" : "ghost"}
                className={cn(
                  "px-4 py-2 h-auto text-sm font-medium rounded-xl",
                  selectedVariant === variant
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-white"
                )}
              >
                Variant {variant}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "outline" : "ghost"}
              size="icon"
              className={cn(
                "p-2 h-auto w-auto rounded-xl",
                viewMode === "list" ? "bg-white shadow-sm" : ""
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "outline" : "ghost"}
              size="icon"
              className={cn(
                "p-2 h-auto w-auto rounded-xl",
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              )}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("code")}
              variant={viewMode === "code" ? "outline" : "ghost"}
              size="icon"
              className={cn(
                "p-2 h-auto w-auto rounded-xl",
                viewMode === "code" ? "bg-white shadow-sm" : ""
              )}
              title="Code view"
            >
              <Code2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "list" && selectedDesign && (
        <>
          <VariantPreviewCard
            imageUrl={selectedDesign.imageUrl}
            title={title}
            variantNumber={selectedVariant}
            onCopyImage={() => handleCopyImage(selectedVariant)}
            onDownloadPNG={() => handleDownloadPNG(selectedVariant)}
          />

          <div className="mt-6">
            <VariantCodeBlock
              variantNumber={selectedVariant}
              htmlCode={selectedDesign.html}
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
              defaultExpanded={design.variantNumber === selectedVariant}
            />
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Button
          onClick={onCreateAnother}
          className="px-6 text-white"
          style={{
            background:
              "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
          }}
        >
          Create Another Poster
        </Button>
      </div>
    </div>
  );
}
