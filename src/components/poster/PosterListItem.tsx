import { Download, Star, Image as ImageIcon, Code } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PosterListItemProps {
  id: string;
  title: string;
  image: string;
  timestamp: string;
  variants?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onDownload?: (id: string, format: "png" | "html") => void;
}

export function PosterListItem({
  id,
  title,
  image,
  timestamp,
  variants,
  isFavorite = false,
  onToggleFavorite,
  onDownload,
}: PosterListItemProps) {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(isFavorite);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onToggleFavorite?.(id);
  };

  const handleDownload = (e: React.MouseEvent, format: "png" | "html") => {
    e.stopPropagation();
    onDownload?.(id, format);
  };

  const handleRowClick = () => {
    navigate(`/gallery/${id}`);
  };

  return (
    <div
      className="flex items-center gap-4 py-4 bg-white border-b border-gray-200 transition-all duration-200 cursor-pointer group"
      onClick={handleRowClick}
    >
      <div className="flex-shrink-0">
        <div className="relative w-16 h-16 bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{timestamp}</span>
          {variants && variants > 0 && (
            <>
              <span>•</span>
              <span>
                {variants} variant{variants > 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleToggleFavorite}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-gray-100"
        >
          <Star
            className={`w-4 h-4 ${
              favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            }`}
          />
        </Button>

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Download className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={(e: any) => handleDownload(e, "png")}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Download as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e: any) => handleDownload(e, "html")}>
              <Code className="w-4 h-4 mr-2" />
              Download as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
