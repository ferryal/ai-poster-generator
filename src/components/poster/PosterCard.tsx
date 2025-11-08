import { Download, Star, Image as ImageIcon, Code } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PosterCardProps {
  id: string;
  title: string;
  image: string;
  timestamp: string;
  variants?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onDownload?: (id: string, format: "png" | "html") => void;
}

export function PosterCard({
  id,
  title,
  image,
  timestamp,
  variants,
  isFavorite = false,
  onToggleFavorite,
  onDownload,
}: PosterCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
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

  const handleCardClick = () => {
    navigate(`/gallery/${id}`);
  };

  return (
    <Card
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 p-0"
      style={{ width: "210px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative bg-gradient-to-b from-gray-100 to-gray-50 overflow-hidden cursor-pointer"
        style={{ width: "210px", height: "210px" }}
        onClick={handleCardClick}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {isHovered && (
          <div className="absolute inset-0 bg-black/20 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white rounded-lg shadow-lg hover:bg-gray-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    onMouseEnter={() => setDropdownOpen(true)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <DropdownMenuItem
                    onClick={(e: any) => handleDownload(e, "png")}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Download as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e: any) => handleDownload(e, "html")}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Download as HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                size="icon"
                className="bg-white rounded-lg shadow-lg hover:bg-gray-50"
              >
                <Star
                  className={`w-4 h-4 ${
                    favorite ? "fill-yellow-400 text-yellow-400" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 cursor-pointer" onClick={handleCardClick}>
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
      </CardContent>
    </Card>
  );
}
