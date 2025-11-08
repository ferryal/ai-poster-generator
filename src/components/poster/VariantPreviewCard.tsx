import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";

interface VariantPreviewCardProps {
  imageUrl?: string;
  title: string;
  variantNumber: number;
  onCopyImage: () => void;
  onDownloadPNG: () => void;
  showActions?: boolean;
}

export function VariantPreviewCard({
  imageUrl,
  title,
  variantNumber,
  onCopyImage,
  onDownloadPNG,
  showActions = true,
}: VariantPreviewCardProps) {
  return (
    <Card className="rounded-xl p-8 border border-gray-200 bg-[#F9F9F9]">
      <div className="flex items-center justify-center mb-6">
        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt={`${title} - Variant ${variantNumber}`}
              className="max-w-full h-auto"
              style={{
                maxHeight: "600px",
                objectFit: "contain",
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-96 bg-gray-200 rounded-xl">
            <p className="text-gray-500">No preview available</p>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-between">
          <Button
            onClick={onCopyImage}
            variant="ghost"
            className="flex items-center gap-2 text-gray-700 shadow-sm rounded-xl hover:shadow-md"
          >
            <Copy className="w-4 h-4" />
            Copy Image
          </Button>

          <Button
            onClick={onDownloadPNG}
            className="flex items-center gap-2 text-white text-sm font-medium rounded-xl transition-all hover:scale-105 h-auto"
            style={{
              background:
                "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow:
                "0px 12px 8px 8px rgba(227, 227, 227, 0.12), 0px 0px 0px 1px #0A1B33",
            }}
          >
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
        </div>
      )}
    </Card>
  );
}
