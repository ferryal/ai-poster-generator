import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Download, ChevronDown, ChevronUp } from "lucide-react";

interface VariantCodeBlockProps {
  variantNumber: number;
  htmlCode?: string;
  title: string;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  defaultExpanded?: boolean;
}

export function VariantCodeBlock({
  variantNumber,
  htmlCode,
  title,
  onCopyCode,
  onDownloadCode,
  defaultExpanded = true,
}: VariantCodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="rounded-xl border-gray-200 overflow-hidden p-0 gap-0 bg-[#F9F9F9]">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-none h-auto"
      >
        <h2 className="text-lg font-semibold text-gray-900">HTML Code</h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </Button>

      {isExpanded && (
        <CardContent className="p-2">
          <div className="relative">
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <Button
                onClick={onDownloadCode}
                variant="ghost"
                size="icon"
                className="p-2 h-auto w-auto text-gray-600 rounded-xl bg-white/80 hover:bg-white"
                title="Download HTML"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                onClick={onCopyCode}
                variant="ghost"
                size="icon"
                className="p-2 h-auto w-auto text-gray-600 rounded-xl bg-white/80 hover:bg-white"
                title="Copy code"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <pre className="bg-white rounded-xl p-4 pt-14 overflow-x-auto">
              <code className="text-sm text-gray-700 font-mono">
                {htmlCode || "No HTML code available"}
              </code>
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
